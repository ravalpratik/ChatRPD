import { useEffect, useRef } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getAgent } from '../lib/agents.js'

function Message({ message }) {
  const isUser = message.role === 'user'
  const agent = getAgent(message.agent || 'chat')

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3xl rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? 'bg-brand-600 text-white'
            : 'bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800'
        }`}
      >
        {!isUser ? (
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
            {agent.name}
          </p>
        ) : null}
        {message.imageUrl ? (
          <img
            src={message.imageUrl}
            alt={message.content || 'Generated image'}
            className="mb-2 max-h-80 rounded-xl"
          />
        ) : null}
        {message.fileName ? (
          <p className="mb-2 text-xs opacity-80">Attached: {message.fileName}</p>
        ) : null}
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="markdown-body">
            <Markdown remarkPlugins={[remarkGfm]}>{message.content || ''}</Markdown>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MessageList({ messages, loading, sending }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
        Loading messages...
      </div>
    )
  }

  if (!messages.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white shadow-glow">
          R
        </div>
        <h2 className="text-xl font-semibold">Start a conversation</h2>
        <p className="mt-2 max-w-md text-sm text-zinc-500">
          Choose an agent, then ask anything. ChatRPD keeps history, files, and generated images in
          one place.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
      {messages.map((message) => (
        <Message key={message._id} message={message} />
      ))}
      {sending ? (
        <div className="flex justify-start">
          <div className="rounded-2xl bg-white px-4 py-3 text-sm text-zinc-500 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            Agent is thinking...
          </div>
        </div>
      ) : null}
      <div ref={endRef} />
    </div>
  )
}
