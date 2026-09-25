import { GoogleGenerativeAI } from '@google/generative-ai'
import { config, missing } from '../config.js'

let client

function getClient() {
  if (!config.geminiApiKey) {
    throw missing('GEMINI_API_KEY')
  }
  if (!client) {
    client = new GoogleGenerativeAI(config.geminiApiKey)
  }
  return client
}

export async function generateGeminiText({ system, prompt, history = [], useSearch = false }) {
  const model = getClient().getGenerativeModel({
    model: 'gemini-3.5-flash',
    systemInstruction: system,
    tools: useSearch ? [{ googleSearch: {} }] : undefined,
  })

  const contents = [
    ...history
      .filter((msg) => (msg.content || '').trim())
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content || '' }],
      })),
    { role: 'user', parts: [{ text: prompt }] },
  ]

  const result = await model.generateContent({ contents })
  const text = result.response.text()
  if (!text) {
    throw new Error('Gemini returned an empty response')
  }
  return text
}
