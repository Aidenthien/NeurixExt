import { API_KEYS, API_ENDPOINTS } from '../config/api-keys'

const MODEL_MAP: Record<string, string> = {
  'DeepSeek': 'deepseek/deepseek-chat-v3-0324:free',
  'GPT-OSS-20B': 'openai/gpt-oss-20b:free',
  'GLM-4.5-Air': 'z-ai/glm-4.5-air:free',
  'Qwen3-235B': 'qwen/qwen3-235b-a22b:free',
  'Gemini-2.0-Flash': 'google/gemini-2.0-flash-exp:free'
}

interface ModelStatus {
  name: string
  icon: string
  color: string
  available: boolean
  error?: string
}

export async function checkModelStatus(modelName: string, icon: string, color: string): Promise<ModelStatus> {
  if (!API_KEYS.OPENROUTER_API_KEY) {
    return {
      name: modelName,
      icon,
      color,
      available: false,
      error: 'API key not configured'
    }
  }

  const openRouterModel = MODEL_MAP[modelName]
  if (!openRouterModel) {
    return {
      name: modelName,
      icon,
      color,
      available: false,
      error: 'Model not found'
    }
  }

  try {
    const response = await fetch(API_ENDPOINTS.OPENROUTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEYS.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://neurix-ext.com',
        'X-Title': 'NeurixExt'
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      })
    })

    if (response.ok) {
      return {
        name: modelName,
        icon,
        color,
        available: true
      }
    } else if (response.status === 429) {
      return {
        name: modelName,
        icon,
        color,
        available: false,
        error: 'Rate limited'
      }
    } else {
      return {
        name: modelName,
        icon,
        color,
        available: false,
        error: 'API error'
      }
    }
  } catch (error) {
    return {
      name: modelName,
      icon,
      color,
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function checkAllModelsStatus(models: Array<{ name: string; icon: string; color: string }>): Promise<ModelStatus[]> {
  const statusChecks = models.map(model => 
    checkModelStatus(model.name, model.icon, model.color)
  )
  
  return Promise.all(statusChecks)
}
