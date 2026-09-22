import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { api } from '../api'

export default function MFA() {
  const nav = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!/^\d{6}$/.test(code)) return setError('Enter the 6-digit verification code.')
    try {
      await api.mfa({ code })
      nav('/dashboard')
    } catch (err) {
      setError(err.data?.error || 'Verification failed.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <header className="text-center mb-6">
          <ShieldCheck size={40} className="mx-auto text-brand-600" aria-hidden="true" />
          <h1 className="text-xl font-bold text-gray-800 mt-2">Two-Factor Verification</h1>
          <p className="text-sm text-gray-600 mt-1">Enter the 6-digit verification code.</p>
        </header>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              6-Digit Code
            </label>
            <input
              id="otp"
              inputMode="numeric"
              maxLength={6}
              pattern="\d{6}"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-2xl tracking-[0.5em] py-3 border border-gray-300 rounded"
              aria-describedby="otp-help"
              required
            />
            <p id="otp-help" className="text-xs text-gray-500 mt-2">
              Prototype MFA / Demo OTP: <strong>123456</strong>
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-300 rounded p-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 rounded"
          >
            Verify
          </button>
        </form>
      </div>
    </main>
  )
}