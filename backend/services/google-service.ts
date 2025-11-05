import type { AIRequest, AIModelResponse } from '../types/ai-models'
import { API_KEYS, API_ENDPOINTS } from '../config/api-keys'

export async function callGemini(request: AIRequest): Promise<AIModelResponse> {
  try {
    if (!API_KEYS.GOOGLE_API_KEY) {
      return {
        success: false,
        error: 'Google API key not configured',
        model: 'Gemini'
      }
    }

    const response = await fetch(`${API_ENDPOINTS.GOOGLE}?key=${API_KEYS.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: request.message
              }
            ]
          }
        ],
        generationConfig: {
          temperature: request.temperature || 0.7,
          maxOutputTokens: request.maxTokens || 500
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.error?.message || 'Gemini API request failed',
        model: 'Gemini'
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data.candidates[0].content.parts[0].text,
      model: 'Gemini'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      model: 'Gemini'
    }
  }
}
