
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, User, ArrowLeft, ArrowRight } from 'lucide-react'
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

    if (!username.trim()) {
      return setError('Username or email is required.')
    }

    if (!password) {
      return setError('Password is required.')
    }

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
    <main className="min-h-screen bg-[#F8F6F1] text-[#292725]">

      {/* Top Navigation */}
      <header className="border-b border-[#DED8CD]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="text-lg font-semibold tracking-[0.12em]">
            ATHALIAH <span className="font-light">COLLECTIONS</span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 text-xs tracking-wider text-[#6F5C4B] transition hover:text-[#A58F70]"
          >
            <ArrowLeft size={15} />
            BACK TO HOME
          </Link>
        </div>
      </header>

      {/* Login Content */}
      <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-12">

        <div className="grid w-full max-w-5xl overflow-hidden border border-[#DED8CD] bg-white shadow-sm md:grid-cols-2">

          {/* Left Side */}
          <div className="relative flex min-h-[280px] items-center justify-center bg-[#EAE2D5] p-8 sm:min-h-[350px] md:min-h-[550px]">
            <div className="absolute inset-5 border border-[#C8B49D]" />

            <div className="relative text-center">
              <p className="text-xs tracking-[0.35em] text-[#8B7663]">
                WELCOME TO
              </p>

              <h1 className="mt-5 text-3xl font-light tracking-[0.12em] sm:text-4xl">
                ATHALIAH
              </h1>

              <div className="mx-auto my-6 h-px w-20 bg-[#A58F70]" />

              <p className="text-xs tracking-[0.3em] text-[#6F5C4B]">
                COLLECTIONS
              </p>

              <p className="mt-8 text-sm italic text-[#8B7663]">
                Simple things. Timeless style.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center justify-center p-6 sm:p-10 md:p-12">
            <div className="w-full max-w-sm">

              <div className="mb-8">
                <p className="text-xs tracking-[0.25em] text-[#A58F70]">
                  ADMIN ACCESS
                </p>

                <h2 className="mt-3 text-3xl font-light">
                  Welcome Back
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#777067]">
                  Sign in to manage your Athaliah Collections store.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-5" noValidate>

                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-xs font-medium tracking-wider text-[#6F5C4B]"
                  >
                    USERNAME OR EMAIL
                  </label>

                  <div className="relative">
                    <User
                      size={17}
                      className="absolute left-3 top-3.5 text-[#A58F70]"
                      aria-hidden="true"
                    />

                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full border border-[#DED8CD] bg-[#F8F6F1] py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#A58F70]"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-medium tracking-wider text-[#6F5C4B]"
                  >
                    PASSWORD
                  </label>

                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-3 top-3.5 text-[#A58F70]"
                      aria-hidden="true"
                    />

                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full border border-[#DED8CD] bg-[#F8F6F1] py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#A58F70]"
                      required
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <p
                    role="alert"
                    className="border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    {error}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 bg-[#292725] py-4 text-xs tracking-[0.18em] text-white transition hover:bg-[#8B7663] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'SIGNING IN...' : 'SIGN IN'}
                  {!loading && <ArrowRight size={16} />}
                </button>

              </form>

              <p className="mt-8 text-center text-xs leading-6 text-[#8B7663]">
                Authorized personnel only.
                <br />
                Athaliah Collections Admin Portal
              </p>

            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#DED8CD] px-5 py-5 text-center text-xs text-[#8B7663]">
        © {new Date().getFullYear()} Athaliah Collections. All rights reserved.
      </footer>

    </main>
  )
}
