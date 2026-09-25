import { useState } from 'react'
import { getAgent } from '../lib/agents.js'

export default function Composer({ agent, sending, fileRef, onSend }) {
  const [text, setText] = useState('')
  const current = getAgent(agent)
  const needsFile = agent === 'docs'

  const submit = (event) => {
    event.preventDefault()
    const file = fileRef.current?.files?.[0]
    onSend({ text, file })
    setText('')
  }

  return (
    <form onSubmit={submit} className="border-t border-zinc-200 p-4 dark:border-zinc-800">
      <p className="mb-2 text-xs text-zinc-500">{current.description}</p>
      <div className="rounded-2xl border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
        {needsFile ? (
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="mb-2 block w-full text-xs"
          />
        ) : (
          <input ref={fileRef} type="file" className="hidden" />
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit(e)
            }
          }}
          rows={2}
          placeholder={`Message ${current.name}...`}
          className="w-full resize-none bg-transparent px-2 py-2 text-sm outline-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={sending}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </form>
  )
}
