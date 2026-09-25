import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { AGENTS } from '../lib/agents.js'

export default function Landing() {
  const { user, loading, error, setError } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    if (params.get('error') === 'auth') {
      setError('Google sign-in failed. Please try again.')
    }
  }, [params, setError])

  useEffect(() => {
    if (!loading && user) navigate('/app', { replace: true })
  }, [loading, user, navigate])

  return (
    <div className="min-h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200 via-zinc-50 to-zinc-50 dark:from-indigo-950/50 dark:via-zinc-950 dark:to-zinc-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-glow">
            R
          </div>
          <span className="text-lg font-semibold tracking-tight">ChatRPD</span>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-brand-600 dark:text-indigo-400">
            College AI Studio
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            One Chat.
            <br />
            Multiple AI Agents.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            ChatRPD routes every conversation to the right specialist — chat, search, image,
            code, or document Q&amp;A — in one modern workspace.
          </p>
          {error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          ) : null}
          <a
            // href="/api/auth/google"
            href="https://chatrpd.onrender.com/api/auth/google"
            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-lg ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:bg-zinc-900 dark:text-white dark:ring-zinc-700"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </a>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {AGENTS.map((agent) => (
            <div
              key={agent.id}
              className="rounded-2xl border border-zinc-200/80 bg-white/70 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70"
            >
              <div className={`mb-3 h-1.5 w-10 rounded-full bg-gradient-to-r ${agent.accent}`} />
              <h2 className="font-semibold">{agent.name}</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{agent.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
