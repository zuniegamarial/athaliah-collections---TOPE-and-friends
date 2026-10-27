
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import { api } from '../api'

export default function MFA() {
  const nav = useNavigate()

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!/^\d{6}$/.test(code)) {
      return setError('Enter the 6-digit verification code.')
    }

    setLoading(true)

    try {
      await api.mfa({ code })
      nav('/dashboard')
    } catch (err) {
      setError(err.data?.error || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F6F1] text-[#292725]">

      {/* Header */}
      <header className="border-b border-[#DED8CD]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="text-lg font-semibold tracking-[0.12em]">
            ATHALIAH <span className="font-light">COLLECTIONS</span>
          </Link>

          <Link
            to="/login"
            className="flex items-center gap-2 text-xs tracking-wider text-[#6F5C4B] transition hover:text-[#A58F70]"
          >
            <ArrowLeft size={15} />
            BACK TO LOGIN
          </Link>
        </div>
      </header>

      {/* Verification Content */}
      <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-12">

        <div className="grid w-full max-w-5xl overflow-hidden border border-[#DED8CD] bg-white shadow-sm md:grid-cols-2">

          {/* Left Panel */}
          <div className="relative flex min-h-[280px] items-center justify-center bg-[#EAE2D5] p-8 sm:min-h-[350px] md:min-h-[500px]">
            <div className="absolute inset-5 border border-[#C8B49D]" />

            <div className="relative text-center">
              <ShieldCheck
                size={48}
                strokeWidth={1}
                className="mx-auto text-[#8B7663]"
              />

              <h1 className="mt-6 text-3xl font-light tracking-[0.12em]">
                ATHALIAH
              </h1>

              <div className="mx-auto my-6 h-px w-20 bg-[#A58F70]" />

              <p className="text-xs tracking-[0.25em] text-[#6F5C4B]">
                SECURE ACCESS
              </p>

              <p className="mt-6 text-sm italic text-[#8B7663]">
                Your security matters to us.
              </p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex items-center justify-center p-6 sm:p-10 md:p-12">
            <div className="w-full max-w-sm">

              <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center bg-[#EAE2D5] text-[#8B7663]">
                  <Lock size={22} />
                </div>

                <p className="text-xs tracking-[0.25em] text-[#A58F70]">
                  ACCOUNT SECURITY
                </p>

                <h2 className="mt-3 text-3xl font-light">
                  Verify Your Identity
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#777067]">
                  Enter the six-digit verification code to continue to your
                  Athaliah Collections admin dashboard.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-5" noValidate>

                <div>
                  <label
                    htmlFor="otp"
                    className="mb-2 block text-xs font-medium tracking-wider text-[#6F5C4B]"
                  >
                    6-DIGIT VERIFICATION CODE
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={code}
                    onChange={e =>
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="000000"
                    className="w-full border border-[#DED8CD] bg-[#F8F6F1] px-3 py-4 text-center text-2xl tracking-[0.5em] outline-none transition focus:border-[#A58F70]"
                    aria-describedby="otp-help"
                    required
                  />

                  <p id="otp-help" className="mt-3 text-xs text-[#8B7663]">
                    Prototype MFA / Demo OTP: <strong>123456</strong>
                  </p>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 bg-[#292725] py-4 text-xs tracking-[0.18em] text-white transition hover:bg-[#8B7663] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'VERIFYING...' : 'VERIFY AND CONTINUE'}
                  {!loading && <ArrowRight size={16} />}
                </button>

              </form>

              <p className="mt-8 text-center text-xs leading-6 text-[#8B7663]">
                Protected Admin Access
                <br />
                Athaliah Collections
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
