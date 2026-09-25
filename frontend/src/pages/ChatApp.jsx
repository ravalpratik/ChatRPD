import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api.js'
import { AGENTS, getAgent } from '../lib/agents.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import Sidebar from '../components/Sidebar.jsx'
import MessageList from '../components/MessageList.jsx'
import Composer from '../components/Composer.jsx'

export default function ChatApp() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [chats, setChats] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [agent, setAgent] = useState('chat')
  const [query, setQuery] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingChats, setLoadingChats] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const fileRef = useRef(null)

  const activeChat = useMemo(
    () => chats.find((c) => c._id === activeId) || null,
    [chats, activeId]
  )

  const loadChats = useCallback(async (search = '') => {
    setLoadingChats(true)
    try {
      const data = await api.get(`/api/chats${search ? `?q=${encodeURIComponent(search)}` : ''}`)
      setChats(data.chats)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingChats(false)
    }
  }, [])

  useEffect(() => {
    loadChats()
  }, [loadChats])

  const openChat = async (id) => {
    setActiveId(id)
    setSidebarOpen(false)
    setLoadingMessages(true)
    setError('')
    try {
      const data = await api.get(`/api/chats/${id}`)
      setMessages(data.chat.messages || [])
      setAgent(data.chat.agent || 'chat')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingMessages(false)
    }
  }

  const createChat = async (nextAgent = agent) => {
    setError('')
    try {
      const data = await api.post('/api/chats', { agent: nextAgent, title: 'New chat' })
      setChats((prev) => [data.chat, ...prev])
      setActiveId(data.chat._id)
      setMessages([])
      setAgent(nextAgent)
      setSidebarOpen(false)
      return data.chat
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  const renameChat = async (id, title) => {
    const data = await api.patch(`/api/chats/${id}`, { title })
    setChats((prev) => prev.map((c) => (c._id === id ? data.chat : c)))
  }

  const deleteChat = async (id) => {
    await api.delete(`/api/chats/${id}`)
    setChats((prev) => prev.filter((c) => c._id !== id))
    if (activeId === id) {
      setActiveId(null)
      setMessages([])
    }
  }

  const sendMessage = async ({ text, file }) => {
    if (sending) return
    const content = text.trim()
    if (!content && !file) return

    setSending(true)
    setError('')
    let chat = activeChat
    if (!chat) {
      chat = await createChat(agent)
      if (!chat) {
        setSending(false)
        return
      }
    }

    const optimistic = {
      _id: `tmp-${Date.now()}`,
      role: 'user',
      content: content || (file ? `Uploaded ${file.name}` : ''),
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    try {
      const form = new FormData()
      form.append('content', content)
      form.append('agent', agent)
      if (file) form.append('file', file)
      const data = await api.post(`/api/chats/${chat._id}/messages`, form)
      setMessages(data.chat.messages)
      setChats((prev) => {
        const updated = data.chat
        return [updated, ...prev.filter((c) => c._id !== updated._id)]
      })
    } catch (err) {
      setError(err.message)
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id))
    } finally {
      setSending(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const currentAgent = getAgent(agent)

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar
        user={user}
        chats={chats}
        activeId={activeId}
        query={query}
        loading={loadingChats}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onQuery={(value) => {
          setQuery(value)
          loadChats(value)
        }}
        onNew={() => createChat(agent)}
        onOpen={openChat}
        onRename={renameChat}
        onDelete={deleteChat}
        onLogout={logout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex min-w-0 flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
        <header className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <button
            type="button"
            className="rounded-lg p-2 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open chats"
          >
            <span className="block h-0.5 w-5 bg-current mb-1" />
            <span className="block h-0.5 w-5 bg-current mb-1" />
            <span className="block h-0.5 w-5 bg-current" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{activeChat?.title || 'New conversation'}</p>
            <p className="text-xs text-zinc-500">{currentAgent.name}</p>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
          {AGENTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setAgent(item.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                agent === item.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              {item.short}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <MessageList loading={loadingMessages} messages={messages} sending={sending} />
        <Composer
          agent={agent}
          sending={sending}
          fileRef={fileRef}
          onSend={sendMessage}
        />
      </main>
    </div>
  )
}
