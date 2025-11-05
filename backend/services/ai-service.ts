import type { AIRequest, AIResponse } from '../types/ai-models'
import { AI_MODELS } from '../config/models'
import { callOpenAI } from './openai-service'
import { callClaude } from './anthropic-service'
import { callGemini } from './google-service'
import { callDeepSeek } from './deepseek-service'

export async function getAllAIResponses(request: AIRequest): Promise<AIResponse[]> {
  const enabledModels = AI_MODELS.filter(model => model.enabled)
  
  const responsePromises = enabledModels.map(async (model) => {
    let result
    
    switch (model.name) {
      case 'ChatGPT':
        result = await callOpenAI(request)
        break
      case 'Claude':
        result = await callClaude(request)
        break
      case 'Gemini':
        result = await callGemini(request)
        break
      case 'DeepSeek':
        result = await callDeepSeek(request)
        break
      default:
        result = { success: false, error: 'Unknown model', model: model.name }
    }

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

  let result
  
  switch (modelName) {
    case 'ChatGPT':
      result = await callOpenAI(request)
      break
    case 'Claude':
      result = await callClaude(request)
      break
    case 'Gemini':
      result = await callGemini(request)
      break
    case 'DeepSeek':
      result = await callDeepSeek(request)
      break
    default:
      return null
  }

  return {
    model: model.name,
    text: result.success ? result.data! : `Error: ${result.error}`,
    icon: model.icon,
    color: model.color,
    timestamp: new Date(),
    error: result.success ? undefined : result.error
  }
}
