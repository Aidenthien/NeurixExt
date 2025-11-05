// API Keys Configuration
// IMPORTANT: Never commit this file with real API keys
// Use environment variables or Chrome storage API for production

export const API_KEYS = {
  OPENAI_API_KEY: process.env.PLASMO_PUBLIC_OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.PLASMO_PUBLIC_ANTHROPIC_API_KEY || '',
  GOOGLE_API_KEY: process.env.PLASMO_PUBLIC_GOOGLE_API_KEY || '',
  DEEPSEEK_API_KEY: process.env.PLASMO_PUBLIC_DEEPSEEK_API_KEY || ''
}

export const API_ENDPOINTS = {
  OPENAI: 'https://api.openai.com/v1/chat/completions',
  ANTHROPIC: 'https://api.anthropic.com/v1/messages',
  GOOGLE: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
  DEEPSEEK: 'https://api.deepseek.com/v1/chat/completions'
}
