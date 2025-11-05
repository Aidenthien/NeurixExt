import type { AIRequest, AIResponse } from '../types/ai-models'
import { AI_MODELS } from '../config/models'
import { callOpenRouter } from './openrouter-service'

export async function getAllAIResponses(request: AIRequest): Promise<AIResponse[]> {
  const enabledModels = AI_MODELS.filter(model => model.enabled)
  
  const responsePromises = enabledModels.map(async (model) => {
    const result = await callOpenRouter(request, model.name)

    return {
      model: model.name,
      text: result.success ? result.data! : `Error: ${result.error}`,
      icon: model.icon,
      color: model.color,
      timestamp: new Date(),
      error: result.success ? undefined : result.error
    }
  })

  return Promise.all(responsePromises)
}

export async function getSingleAIResponse(modelName: string, request: AIRequest): Promise<AIResponse | null> {
  const model = AI_MODELS.find(m => m.name === modelName)
  
  if (!model) {
    return null
  }

  const result = await callOpenRouter(request, modelName)

  return {
    model: model.name,
    text: result.success ? result.data! : `Error: ${result.error}`,
    icon: model.icon,
    color: model.color,
    timestamp: new Date(),
    error: result.success ? undefined : result.error
  }
}
