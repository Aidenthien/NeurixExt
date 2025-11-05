import type { AIRequest, AIModelResponse } from '../types/ai-models'
import { API_KEYS, API_ENDPOINTS } from '../config/api-keys'

export async function callOpenAI(request: AIRequest): Promise<AIModelResponse> {
  try {
    if (!API_KEYS.OPENAI_API_KEY) {
      return {
        success: false,
        error: 'OpenAI API key not configured',
        model: 'ChatGPT'
      }
    }

    const response = await fetch(API_ENDPOINTS.OPENAI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEYS.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
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
        error: error.error?.message || 'OpenAI API request failed',
        model: 'ChatGPT'
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data.choices[0].message.content,
      model: 'ChatGPT'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      model: 'ChatGPT'
    }
  }
}
