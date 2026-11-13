import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, Lock, CheckCircle2 } from 'lucide-react'
import { api } from '../api'

export default function MFA() {
  const nav = useNavigate()

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'spinning' | 'success'
  const [progress, setProgress] = useState(0)
  const inputRefs = useRef([])

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    setError('')

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (digit && index === 5 && newOtp.every(d => d !== '')) {
      triggerSpinningAndVerify(newOtp.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newOtp = [...otp]
      if (newOtp[index]) {
        newOtp[index] = ''
        setOtp(newOtp)
      } else if (index > 0) {
        newOtp[index - 1] = ''
        setOtp(newOtp)
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      inputRefs.current[5]?.focus()
      triggerSpinningAndVerify(pastedData)
    }
  }

  const triggerSpinningAndVerify = async (codeToVerify) => {
    setStatus('spinning')
    setProgress(0)

    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 12) + 8
      if (currentProgress >= 100) {
        currentProgress = 100
        clearInterval(interval)
      }
      setProgress(currentProgress)
    }, 100)

    try {
      await api.mfa({ code: codeToVerify })
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => {
        setStatus('success')
        localStorage.removeItem('pending_mfa_user')
        setTimeout(() => {
          nav('/dashboard')
        }, 1200)
      }, 300)
    } catch (err) {
      clearInterval(interval)
      setStatus('idle')
      if (err.status === 401 && err.message === 'Please sign in first.') {
        return nav('/admin')
      }
      setError(
        err.status
          ? err.message
          : 'Cannot reach the server. Make sure the backend is running on port 5000.'
      )
    }
  }

  const submit = (e) => {
    e.preventDefault()
    const fullCode = otp.join('')
    if (fullCode.length !== 6) {
      return setError('Enter the 6-digit verification code.')
    }
    triggerSpinningAndVerify(fullCode)
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="text-lg font-semibold tracking-[0.12em] text-white">
            ATHALIAH <span className="font-light text-indigo-400">COLLECTIONS</span>
          </Link>

          <Link
            to="/admin"
            className="flex items-center gap-2 text-xs tracking-wider text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={15} />
            BACK TO LOGIN
          </Link>
        </div>
      </header>

      {/* Verification Content */}
      <section className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-800 shadow-2xl md:grid-cols-2">

          {/* Left Panel */}
          <div className="relative flex min-h-[280px] items-center justify-center border-b border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-8 sm:min-h-[350px] md:min-h-[500px] md:border-b-0 md:border-r">
            <div className="absolute inset-5 rounded-2xl border border-slate-700/60" />

            <div className="relative text-center">
              <div className="mb-4 flex justify-center text-indigo-400">
                <ShieldCheck size={48} strokeWidth={1.5} />
              </div>

              <p className="text-xs font-bold tracking-[0.35em] text-indigo-400">SECURE ACCESS</p>

              <h1 className="mt-5 text-3xl font-light tracking-[0.12em] text-white sm:text-4xl">
                ATHALIAH
              </h1>

              <div className="mx-auto my-6 h-px w-20 bg-indigo-500" />

              <p className="text-xs tracking-[0.3em] text-slate-300">COLLECTIONS</p>

              <p className="mt-8 text-sm italic text-slate-400">Your security matters to us.</p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex items-center justify-center p-6 sm:p-10 md:p-12">
            <div className="w-full max-w-sm text-center md:text-left">

              {status === 'success' ? (
                /* Success Card State */
                <div className="py-6 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl">
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Access Granted</h2>
                  <p className="text-xs text-slate-400 text-center">
                    Welcome back. Redirecting to your dashboard...
                  </p>
                </div>
              ) : (
                /* OTP Form & Circling Animation State */
                <>
                  <div className="mb-8">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 mx-auto md:mx-0">
                      <Lock size={22} />
                    </div>

                    <p className="text-xs font-bold tracking-[0.25em] text-indigo-400">ACCOUNT SECURITY</p>

                    <h2 className="mt-3 text-3xl font-light text-white">
                      {status === 'spinning' ? 'Verifying...' : 'Verify Your Identity'}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {status === 'spinning'
                        ? 'Securely checking your credentials.'
                        : 'Enter the six-digit verification code to continue to your Athaliah Collections admin dashboard.'}
                    </p>
                  </div>

                  {status === 'spinning' ? (
                    /* Circular Progress Loader matching video */
                    <div className="py-8 flex flex-col items-center justify-center space-y-6">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="6" className="text-slate-700 fill-none" />
                          <circle
                            cx="64" cy="64" r="54"
                            stroke="currentColor" strokeWidth="6"
                            className="text-indigo-500 fill-none transition-all duration-150"
                            strokeDasharray={339.29}
                            strokeDashoffset={339.29 - (339.29 * progress) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-2xl font-bold text-white">{progress}%</span>
                      </div>
                      <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase">Security check in progress</p>
                    </div>
                  ) : (
                    /* OTP Input Boxes */
                    <form onSubmit={submit} className="space-y-6" noValidate>
                      <div>
                        <label className="mb-3 block text-xs font-medium tracking-wider text-slate-300">
                          6-DIGIT VERIFICATION CODE
                        </label>

                        <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                          {otp.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={el => (inputRefs.current[idx] = el)}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={e => handleChange(idx, e.target.value)}
                              onKeyDown={e => handleKeyDown(idx, e)}
                              className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border bg-slate-900 text-center text-xl sm:text-2xl font-bold text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 border-slate-700"
                            />
                          ))}
                        </div>

                        <p className="mt-3 text-xs text-slate-400">
                          Prototype MFA / Demo OTP: <strong className="text-indigo-300">123456</strong>
                        </p>
                      </div>

                      {error && (
                        <p
                          role="alert"
                          className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
                        >
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        style={{ backgroundColor: '#2563eb' }}
                        className="flex w-full items-center justify-center gap-3 rounded-xl py-3.5 text-xs font-bold tracking-[0.18em] text-white shadow-lg transition hover:opacity-90"
                      >
                        VERIFY AND CONTINUE
                      </button>
                    </form>
                  )}
                </>
              )}

              <p className="mt-8 text-center md:text-left text-xs leading-6 text-slate-500">
                Protected Admin Access
                <br />
                Athaliah Collections
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-5 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Athaliah Collections. All rights reserved.
      </footer>
    </main>
  )
}