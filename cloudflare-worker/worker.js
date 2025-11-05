/**
 * Cloudflare Worker - OpenRouter API Proxy
 * 
 * This worker acts as a secure proxy between your Chrome extension and OpenRouter API.
 * It keeps your API key secret and allows you to implement rate limiting and usage tracking.
 */

// Model ID mapping
const MODEL_MAP = {
  'DeepSeek': 'deepseek/deepseek-chat-v3-0324:free',
  'GPT-OSS-20B': 'openai/gpt-oss-20b:free',
  'GLM-4.5-Air': 'z-ai/glm-4.5-air:free',
  'Qwen3-235B': 'qwen/qwen3-235b-a22b:free',
  'Gemini-2.0-Flash': 'google/gemini-2.0-flash-exp:free'
}

// Rate limiting configuration (requests per minute per IP)
const RATE_LIMIT = 30
const RATE_LIMIT_WINDOW = 60000 // 1 minute in milliseconds

// In-memory rate limiting store (resets when worker restarts)
const rateLimitStore = new Map()

/**
 * CORS headers for Chrome extension
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace with your extension ID
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

/**
 * Handle CORS preflight requests
 */
function handleOptions(request) {
  return new Response(null, {
    headers: corsHeaders
  })
}

/**
 * Simple rate limiting implementation
 */
function checkRateLimit(ip) {
  const now = Date.now()
  const userRequests = rateLimitStore.get(ip) || []
  
  // Remove old requests outside the window
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW)
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false
  }
  
  recentRequests.push(now)
  rateLimitStore.set(ip, recentRequests)
  
  // Clean up old entries periodically
  if (rateLimitStore.size > 1000) {
    rateLimitStore.clear()
  }
  
  return true
}

/**
 * Forward request to OpenRouter API
 */
async function forwardToOpenRouter(request, env) {
  try {
    // Parse the incoming request
    const body = await request.json()
    
    // Validate required fields
    if (!body.modelName || !body.messages) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: modelName and messages'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }
    
    // Get the OpenRouter model ID
    const openRouterModel = MODEL_MAP[body.modelName]
    if (!openRouterModel) {
      return new Response(JSON.stringify({
        success: false,
        error: `Invalid model: ${body.modelName}`
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }
    
    // Prepare OpenRouter request
    const openRouterRequest = {
      model: openRouterModel,
      messages: body.messages,
      temperature: body.temperature || 0.7,
      max_tokens: body.maxTokens || 500
    }
    
    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': env.APP_URL || 'https://neurix-ext.com',
        'X-Title': 'NeurixExt'
      },
      body: JSON.stringify(openRouterRequest)
    })
    
    const responseData = await response.json()
    
    if (!response.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: responseData.error?.message || 'OpenRouter API request failed',
        model: body.modelName
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }
    
    // Return successful response
    return new Response(JSON.stringify({
      success: true,
      data: responseData.choices[0].message.content,
      model: body.modelName,
      usage: responseData.usage
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error',
      model: 'unknown'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
}

/**
 * Health check endpoint
 */
function handleHealthCheck() {
  return new Response(JSON.stringify({
    status: 'healthy',
    service: 'neurix-openrouter-proxy',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  })
}

/**
 * Main worker handler
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request)
    }
    
    // Health check endpoint
    if (url.pathname === '/health') {
      return handleHealthCheck()
    }
    
    // Main proxy endpoint
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      // Get client IP for rate limiting
      const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown'
      
      // Check rate limit
      if (!checkRateLimit(clientIP)) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          model: 'unknown'
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            ...corsHeaders
          }
        })
      }
      
      // Validate API key is configured
      if (!env.OPENROUTER_API_KEY) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Server configuration error: API key not set'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        })
      }
      
      return forwardToOpenRouter(request, env)
    }
    
    // Invalid endpoint
    return new Response(JSON.stringify({
      error: 'Not found'
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
}
