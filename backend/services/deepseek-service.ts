import type { AIRequest, AIModelResponse } from '../types/ai-models'
import { API_KEYS, API_ENDPOINTS } from '../config/api-keys'

export async function callDeepSeek(request: AIRequest): Promise<AIModelResponse> {
  try {
    if (!API_KEYS.DEEPSEEK_API_KEY) {
      return {
        success: false,
        error: 'DeepSeek API key not configured',
        model: 'DeepSeek'
      }
    }

    const response = await fetch(API_ENDPOINTS.DEEPSEEK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEYS.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: request.message
          }
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 500
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.error?.message || 'DeepSeek API request failed',
        model: 'DeepSeek'
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data.choices[0].message.content,
      model: 'DeepSeek'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      model: 'DeepSeek'
    }
  }
}
