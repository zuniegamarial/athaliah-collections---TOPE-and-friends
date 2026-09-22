import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User } from 'lucide-react'
import { api } from '../api'

export default function Login() {
  const nav = useNavigate()
  const [username, setUsername] = useState('admin')
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
      await api.login({ username, password })
      nav('/mfa')
    } catch (err) {
      setError(err.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-brand-700">Athaliah Collections</h1>
          <p className="text-gray-600 text-sm mt-1">Admin Portal</p>
        </header>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username or Email
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-gray-400" aria-hidden="true" />
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:border-brand-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-gray-400" aria-hidden="true" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:border-brand-500"
                required
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-300 rounded p-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 rounded transition disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-gray-500">
          Demo credentials: <strong>admin</strong> / <strong>admin123</strong>
        </p>
      </div>
    </main>
  )
}