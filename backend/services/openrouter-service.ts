import type { AIRequest, AIModelResponse } from '../types/ai-models'

// Get Worker URL from environment
const WORKER_URL = process.env.PLASMO_PUBLIC_WORKER_URL || 'http://localhost:8787'

export async function callOpenRouter(request: AIRequest, modelName: string): Promise<AIModelResponse> {
  try {
    if (!WORKER_URL) {
      return {
        success: false,
        error: 'Worker URL not configured',
        model: modelName
      }
    }

    const response = await fetch(`${WORKER_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        modelName: modelName,
        messages: [
          {
            role: 'user',
            content: request.message
          }
        ],
        temperature: request.temperature || 0.7,
        maxTokens: request.maxTokens || 500
      })
    })

    const data = await response.json()

    if (!data.success) {
      return {
        success: false,
        error: data.error || 'Worker request failed',
        model: modelName
      }
    }

    return {
      success: true,
      data: data.data,
      model: modelName
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      model: modelName
    }
  }
}
