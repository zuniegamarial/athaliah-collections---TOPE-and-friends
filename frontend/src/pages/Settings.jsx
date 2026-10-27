
import { useEffect, useState } from 'react'
import { api } from '../api'
import { useNavigate } from 'react-router-dom'

const DEFAULT_BACKGROUND = '#f7f5f0'
const DEFAULT_ACCENT = '#a18b69'

export default function Settings() {
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND)
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function loadPreferences() {
      try {
        const data = await api.preferences()
        setBackgroundColor(data.background_color || DEFAULT_BACKGROUND)
        setAccentColor(data.accent_color || DEFAULT_ACCENT)
      } catch (err) {
        setError(err.message || 'Unable to load preferences.')
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [])

  async function handleSave() {
    setSaving(true)
    setMessage('')
    setError('')

    try {
      await api.updatePreferences({
        background_color: backgroundColor,
        accent_color: accentColor,
      })

      setMessage('Your preferences have been saved successfully.')
    } catch (err) {
      setError(err.message || 'Unable to save preferences.')
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setBackgroundColor(DEFAULT_BACKGROUND)
    setAccentColor(DEFAULT_ACCENT)
    setMessage('')
    setError('')
  }

  if (loading) {
    return (
      <div className="p-8 text-sm text-[#81796e]">
        Loading your preferences...
      </div>
    )
  }

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ backgroundColor }}
    >
      <div className="mx-auto max-w-4xl">
        <p
          className="text-xs uppercase tracking-[0.25em]"
          style={{ color: accentColor }}
        >
          System Preferences
        </p>
        <button
  onClick={() => navigate(-1)}
  className="mb-6 flex items-center gap-2 text-sm text-[#81796e] hover:text-[#302d29]"
>
  ← Back
</button>

        <h1 className="mt-2 text-3xl font-semibold text-[#302d29]">
          Settings
        </h1>

        <p className="mt-2 text-sm text-[#81796e]">
          Customize the appearance of your Athaliah Collections account.
        </p>

        <div className="mt-8 rounded-xl border border-[#e7e0d5] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#302d29]">
            Appearance
          </h2>

          <p className="mt-1 text-sm text-[#81796e]">
            Choose your preferred background and accent colors.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-3 block text-sm font-medium text-[#302d29]">
                Background Color
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-12 w-16 cursor-pointer rounded border-0"
                />

                <span className="text-sm uppercase text-[#81796e]">
                  {backgroundColor}
                </span>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-[#302d29]">
                Accent / Line Color
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-12 w-16 cursor-pointer rounded border-0"
                />

                <span className="text-sm uppercase text-[#81796e]">
                  {accentColor}
                </span>
              </div>
            </div>
          </div>

          <div
            className="mt-8 rounded-lg border p-5"
            style={{
              backgroundColor,
              borderColor: accentColor,
            }}
          >
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: accentColor }}
            >
              Live Preview
            </p>

            <h3 className="mt-3 text-xl font-semibold text-[#302d29]">
              Athaliah Collections
            </h3>

            <p className="mt-2 text-sm text-[#81796e]">
              This is how your selected colors will look.
            </p>

            <div
              className="mt-4 inline-block rounded-md px-5 py-2 text-sm text-white"
              style={{ backgroundColor: accentColor }}
            >
              Sample Button
            </div>
          </div>

          {message && (
            <p className="mt-5 text-sm text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-5 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md px-6 py-3 text-sm text-white disabled:opacity-50"
              style={{ backgroundColor: accentColor }}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>

            <button
              onClick={handleReset}
              className="rounded-md border border-[#d8d0c4] px-6 py-3 text-sm text-[#5c554b]"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
