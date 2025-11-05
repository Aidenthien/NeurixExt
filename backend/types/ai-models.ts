export interface AIModelConfig {
  name: string
  apiEndpoint: string
  icon: string
  color: string
  enabled: boolean
}

export interface AIRequest {
  message: string
  context?: string
  temperature?: number
  maxTokens?: number
}

export interface AIResponse {
  model: string
  text: string
  icon: string
  color: string
  timestamp: Date
  error?: string
}

export interface AIModelResponse {
  success: boolean
  data?: string
  error?: string
  model: string
}
