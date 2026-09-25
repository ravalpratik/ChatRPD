import { generateGeminiText } from './gemini.js'

export async function runChatAgent({ prompt, history }) {
  const content = await generateGeminiText({
    system:
      'You are ChatRPD Normal Chat Agent. Be helpful, concise, and friendly. Use markdown when useful.',
    prompt,
    history,
  })
  return { content, agent: 'chat' }
}
