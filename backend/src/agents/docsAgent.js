import { generateGeminiText } from './gemini.js'

export async function runDocsAgent({ prompt, history, documentText }) {
  if (!documentText) {
    throw new Error('Upload a PDF in this chat before asking document questions')
  }
  const clipped = documentText.slice(0, 24000)
  const content = await generateGeminiText({
    system: `You are ChatRPD Document Q&A Agent. Answer only from the provided document.
If the answer is not in the document, say so.

DOCUMENT:
${clipped}`,
    prompt,
    history,
  })
  return { content, agent: 'docs' }
}
