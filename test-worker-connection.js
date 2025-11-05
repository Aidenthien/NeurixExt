// Test Cloudflare Worker connection from the extension

const WORKER_URL = 'https://neurix-openrouter-proxy.neurix-proxy.workers.dev'

async function testWorkerConnection() {
  console.log('🧪 Testing Cloudflare Worker Connection...')
  console.log('Worker URL:', WORKER_URL)
  console.log('='.repeat(60))
  
  try {
    const response = await fetch(`${WORKER_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        modelName: 'GPT-OSS-20B',
        messages: [
          {
            role: 'user',
            content: 'Say hello in one short sentence to test the connection.'
          }
        ],
        temperature: 0.7,
        maxTokens: 50
      })
    })

    const data = await response.json()

    if (data.success) {
      console.log('✅ SUCCESS! Worker is connected and working!')
      console.log('')
      console.log('Model:', data.model)
      console.log('Response:', data.data)
      if (data.usage) {
        console.log('Tokens used:', data.usage.total_tokens)
      }
      console.log('')
      console.log('🎉 Your extension is ready to use!')
    } else {
      console.log('❌ FAILED - Worker returned error')
      console.log('Error:', data.error)
      console.log('Model:', data.model)
    }
  } catch (error) {
    console.log('❌ FAILED - Connection error')
    console.log('Error:', error.message)
    console.log('')
    console.log('💡 Make sure:')
    console.log('  1. Worker is deployed: wrangler deploy')
    console.log('  2. API key is set: wrangler secret put OPENROUTER_API_KEY')
    console.log('  3. Worker URL is correct in .env.local')
  }
}

testWorkerConnection()
