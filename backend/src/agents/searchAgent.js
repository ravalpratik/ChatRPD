import { generateGeminiText } from './gemini.js'

export async function runSearchAgent({ prompt, history }) {
  const system = `You are ChatRPD Web Search Agent. Use live web search when facts may change.
Cite sources as markdown links. Be concise and structured.`
  try {
    const content = await generateGeminiText({
      system,
      prompt,
      history,
      useSearch: true,
    })
    return { content, agent: 'search' }
  } catch {
    const content = await generateGeminiText({
      system: `${system} If live search is unavailable, answer from knowledge and note that.`,
      prompt,
      history,
    })
    return { content, agent: 'search' }
  }
}
