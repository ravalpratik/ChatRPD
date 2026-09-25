import { runChatAgent } from './chatAgent.js'
import { runSearchAgent } from './searchAgent.js'
import { runImageAgent } from './imageAgent.js'
import { runCodeAgent } from './codeAgent.js'
import { runDocsAgent } from './docsAgent.js'

const runners = {
  chat: runChatAgent,
  search: runSearchAgent,
  image: runImageAgent,
  code: runCodeAgent,
  docs: runDocsAgent,
}

export function getAgentRunner(agent) {
  return runners[agent] || runChatAgent
}
