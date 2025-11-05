import type { AIRequest, AIModelResponse } from '../types/ai-models'
import { API_KEYS, API_ENDPOINTS } from '../config/api-keys'

export async function callClaude(request: AIRequest): Promise<AIModelResponse> {
  try {
    if (!API_KEYS.ANTHROPIC_API_KEY) {
      return {
        success: false,
        error: 'Anthropic API key not configured',
        model: 'Claude'
      }
    }

    const response = await fetch(API_ENDPOINTS.ANTHROPIC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEYS.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: request.maxTokens || 500,
        messages: [
          {
            role: 'user',
            content: request.message
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.error?.message || 'Claude API request failed',
        model: 'Claude'
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data.content[0].text,
      model: 'Claude'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      model: 'Claude'
    }
  }
}
