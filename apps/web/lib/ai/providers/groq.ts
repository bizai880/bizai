import { AIRequest } from '../core'

export class GroqProvider {
  private apiKey = process.env.GROQ_API_KEY
  private baseUrl = 'https://api.groq.com/openai/v1'

  async generate(request: AIRequest): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured')
    }

    const startTime = Date.now()
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: request.model || 'llama3-70b-8192',
          messages: [
            { role: 'system', content: request.systemPrompt || 'You are a helpful assistant.' },
            { role: 'user', content: request.prompt }
          ],
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 2000,
          stream: false
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Groq API error: ${error.error?.message || response.statusText}`)
      }

      const data = await response.json()
      const endTime = Date.now()

      return {
        content: data.choices[0].message.content,
        tokensUsed: data.usage?.total_tokens || 0,
        processingTime: endTime - startTime
      }

    } catch (error) {
      console.error('Groq provider error:', error)
      throw new Error(`Groq failed: ${error.message}`)
    }
  }

  async *generateStream(request: AIRequest) {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured')
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: request.model || 'llama3-70b-8192',
        messages: [
          { role: 'system', content: request.systemPrompt || 'You are a helpful assistant.' },
          { role: 'user', content: request.prompt }
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
        stream: true
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Groq API error: ${error.error?.message || response.statusText}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) throw new Error('No response body')

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content
              if (content) {
                yield content
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}
