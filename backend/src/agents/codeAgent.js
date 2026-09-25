import { generateGeminiText } from './gemini.js'

export async function runCodeAgent({ prompt, history }) {
  const content = await generateGeminiText({
    system:
      'You are ChatRPD Coding Agent. Write correct, production-ready code. Explain briefly, include complete snippets, and call out edge cases.',
    prompt,
    history,
  })
  return { content, agent: 'code' }
}
