export const AGENTS = [
  {
    id: 'chat',
    name: 'Normal Chat',
    short: 'Chat',
    description: 'General conversation powered by Gemini.',
    accent: 'from-indigo-500 to-violet-500',
  },
  {
    id: 'search',
    name: 'Web Search',
    short: 'Search',
    description: 'Answers grounded with current web context.',
    accent: 'from-sky-500 to-cyan-500',
  },
  {
    id: 'image',
    name: 'Image Generation',
    short: 'Image',
    description: 'Create images from text prompts.',
    accent: 'from-fuchsia-500 to-pink-500',
  },
  {
    id: 'code',
    name: 'Coding Agent',
    short: 'Code',
    description: 'Explain, debug, and write code.',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'docs',
    name: 'Document Q&A',
    short: 'Docs',
    description: 'Ask questions about uploaded PDFs.',
    accent: 'from-amber-500 to-orange-500',
  },
]

export function getAgent(id) {
  return AGENTS.find((a) => a.id === id) || AGENTS[0]
}
