import { useState } from 'react'

export default function Sidebar({
  user,
  chats,
  activeId,
  query,
  loading,
  open,
  onClose,
  onQuery,
  onNew,
  onOpen,
  onRename,
  onDelete,
  onLogout,
  theme,
  onToggleTheme,
}) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState('')

  const startRename = (chat) => {
    setEditingId(chat._id)
    setDraft(chat.title)
  }

  const commitRename = async (id) => {
    const title = draft.trim()
    setEditingId(null)
    if (title) await onRename(id, title)
  }

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-zinc-200 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-900 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
              R
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">ChatRPD</p>
              <p className="text-[11px] text-zinc-500">Multi-Agent AI</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNew}
            className="rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white"
          >
            New
          </button>
        </div>

        <div className="px-3">
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search chats"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>

        <div className="mt-3 flex-1 overflow-y-auto px-2">
          {loading ? (
            <p className="px-2 py-4 text-sm text-zinc-500">Loading chats...</p>
          ) : chats.length === 0 ? (
            <p className="px-2 py-4 text-sm text-zinc-500">No conversations yet.</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                className={`group mb-1 rounded-lg px-2 py-2 ${
                  activeId === chat._id
                    ? 'bg-indigo-50 dark:bg-indigo-950/40'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {editingId === chat._id ? (
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => commitRename(chat._id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename(chat._id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="w-full rounded border border-brand-500 bg-white px-2 py-1 text-sm dark:bg-zinc-900"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpen(chat._id)}
                    className="block w-full truncate text-left text-sm"
                  >
                    {chat.title}
                  </button>
                )}
                <div className="mt-1 hidden gap-2 text-[11px] text-zinc-500 group-hover:flex">
                  <button type="button" onClick={() => startRename(chat)}>
                    Rename
                  </button>
                  <button type="button" onClick={() => onDelete(chat._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <div className="mb-3 flex items-center gap-2">
            {user.picture ? (
              <img src={user.picture} alt="" className="h-8 w-8 rounded-full" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {(user.name || 'U').slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-zinc-500">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex-1 rounded-lg border border-zinc-200 py-1.5 text-xs dark:border-zinc-700"
            >
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex-1 rounded-lg bg-zinc-900 py-1.5 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
