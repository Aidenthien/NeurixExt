import type { AIModelConfig } from '../types/ai-models'

export const AI_MODELS: AIModelConfig[] = [
  {
    name: 'GPT-OSS-20B',
    apiEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
    icon: '🤖',
    color: '#10a37f',
    enabled: true
  },
  {
    name: 'GLM-4.5-Air',
    apiEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
    icon: '🧠',
    color: '#6366f1',
    enabled: true
  },
  {
    name: 'Qwen3-235B',
    apiEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
    icon: '🔮',
    color: '#ec4899',
    enabled: true
  },
  {
    name: 'Gemini-2.0-Flash',
    apiEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
    icon: '✨',
    color: '#4285f4',
    enabled: true
  },
  {
    name: 'DeepSeek',
    apiEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
    icon: '🔍',
    color: '#8b5cf6',
    enabled: true
  }
]
