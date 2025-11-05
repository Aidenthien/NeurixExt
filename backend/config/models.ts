import type { AIModelConfig } from '../types/ai-models'

export const AI_MODELS: AIModelConfig[] = [
  {
    name: 'ChatGPT',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    icon: '🤖',
    color: '#10a37f',
    enabled: true
  },
  {
    name: 'Claude',
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    icon: '🎭',
    color: '#6366f1',
    enabled: true
  },
  {
    name: 'Gemini',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
    icon: '✨',
    color: '#4285f4',
    enabled: true
  },
  {
    name: 'DeepSeek',
    apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
    icon: '🔍',
    color: '#8b5cf6',
    enabled: true
  }
]
