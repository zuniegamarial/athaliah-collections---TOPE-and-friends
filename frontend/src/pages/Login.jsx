import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, User, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { api } from '../api'

export default function Login() {
  const nav = useNavigate()

  const [username, setUsername] = useState('admin1')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) return setError('Username or email is required.')
    if (!password) return setError('Password is required.')

    setLoading(true)
    try {
      const res = await api.login({ username: username.trim(), password })
      if (res?.user?.role !== 'admin') {
        setError('This account does not have admin access.')
        return
      }
      localStorage.setItem('pending_mfa_user', res.user.username)
      nav('/mfa')
    } catch (err) {
      setError(
        err.status
          ? err.message
          : 'Cannot reach the server. Make sure the backend is running on port 5000.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="text-lg font-semibold tracking-[0.12em] text-white">
            ATHALIAH <span className="font-light text-indigo-400">COLLECTIONS</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-xs tracking-wider text-slate-400 transition hover:text-white">
            <ArrowLeft size={15} /> BACK TO HOME
          </Link>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="grid w-full max-w-5xl overflow-hidden border border-slate-700 bg-slate-800 rounded-3xl shadow-2xl md:grid-cols-2">
          <div className="relative flex min-h-[280px] items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-8 sm:min-h-[350px] md:min-h-[550px] border-b lg:border-b-0 lg:border-r border-slate-700">
            <div className="absolute inset-5 border border-slate-700/60 rounded-2xl" />
            <div className="relative text-center">
              <div className="flex justify-center mb-4 text-indigo-400">
                <ShieldCheck size={48} />
              </div>
              <p className="text-xs tracking-[0.35em] text-indigo-400 font-bold">WELCOME TO</p>
              <h1 className="mt-5 text-3xl font-light tracking-[0.12em] text-white sm:text-4xl">ATHALIAH</h1>
              <div className="mx-auto my-6 h-px w-20 bg-indigo-500" />
              <p className="text-xs tracking-[0.3em] text-slate-300">COLLECTIONS</p>
              <p className="mt-8 text-sm italic text-slate-400">Simple things. Timeless style.</p>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-10 md:p-12">
            <div className="w-full max-w-sm">
              <div className="mb-8">
                <p className="text-xs tracking-[0.25em] text-indigo-400 font-bold">ADMIN ACCESS</p>
                <h2 className="mt-3 text-3xl font-light text-white">Welcome Back</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">Sign in to manage your Athaliah Collections store.</p>
              </div>

              <form onSubmit={submit} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="username" className="mb-2 block text-xs font-medium tracking-wider text-slate-300">USERNAME OR EMAIL</label>
                  <div className="relative">
                    <User size={17} className="absolute left-3.5 top-3.5 text-indigo-400" aria-hidden="true" />
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full border border-slate-700 bg-slate-900 py-3 pl-10 pr-3 text-sm text-slate-200 outline-none transition focus:border-indigo-500 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-xs font-medium tracking-wider text-slate-300">PASSWORD</label>
                  <div className="relative">
                    <Lock size={17} className="absolute left-3.5 top-3.5 text-indigo-400" aria-hidden="true" />
                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full border border-slate-700 bg-slate-900 py-3 pl-10 pr-3 text-sm text-slate-200 outline-none transition focus:border-indigo-500 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p role="alert" className="border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400 rounded-xl">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: '#2563eb' }}
                  className="flex w-full items-center justify-center gap-3 py-3.5 text-xs tracking-[0.18em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 rounded-xl font-bold shadow-lg"
                >
                  {loading ? 'SIGNING IN...' : 'SIGN IN'}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>

              <p className="mt-8 text-center text-xs leading-6 text-slate-500">
                Authorized personnel only.<br />Athaliah Collections Admin Portal
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-5 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Athaliah Collections. All rights reserved.
      </footer>
    </main>
  )
}