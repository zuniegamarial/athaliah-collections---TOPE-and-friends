import { useEffect, useState } from 'react'
import { Users, Plus, X, Search, Fingerprint } from 'lucide-react'
import { api } from '../api'
import Notification from '../components/Notification'

const empty = {
  full_name: '', preferred_name: '', title: '', gender: '',
  email: '', phone: '', address: '',
}

const GENDERS = ['Woman', 'Man', 'Non-binary', 'Self-describe', 'Prefer not to say']
const TITLES = ['', 'Mr.', 'Ms.', 'Mrs.', 'Mx.', 'Dr.', 'Prof.', 'Self-describe']

function BiometricBadge({ enabled }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      {enabled ? 'Enabled' : 'Disabled'}
    </span>
  )
}

export default function Customers() {
  const [list, setList] = useState([])
  const [q, setQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)

  const accent = 'var(--app-accent, #a18b69)'
  const panelStyle = {
    backgroundColor: 'var(--panel-bg, white)',
    color: 'var(--panel-text, #292725)',
    borderColor: 'var(--panel-border, #ded8cd)',
  }

  const load = () => api.customers().then(setList).catch(() => {})
  useEffect(() => {
    load()
    const timer = setInterval(load, 15000) // new sign-ups appear without refreshing
    return () => clearInterval(timer)
  }, [])

  const filtered = list.filter(c => {
    const needle = q.toLowerCase()
    return (
      !needle ||
      (c.full_name || '').toLowerCase().includes(needle) ||
      (c.email || '').toLowerCase().includes(needle) ||
      (c.username || '').toLowerCase().includes(needle) ||
      (c.phone || '').toLowerCase().includes(needle)
    )
  })

  const save = async (e) => {
    e.preventDefault()
    setErrors({})
    try {
      await api.createCustomer(form)
      setNotice({ type: 'success', message: 'Customer added.' })
      setForm(empty)
      setShowForm(false)
      load()
    } catch (err) {
      if (err.data?.errors) setErrors(err.data.errors)
      else setNotice({ type: 'error', message: err.message })
    }
  }

  const inputClass = (field) =>
    `w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#292725] outline-none focus:ring-2 ${
      errors[field] ? 'border-red-500' : 'border-gray-300'
    }`

  const withBiometrics = list.filter(c => c.biometric_enabled).length

  return (
    <div className="space-y-6" style={{ color: 'var(--app-text, #292725)' }}>
      {notice && <Notification {...notice} onClose={() => setNotice(null)} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users size={21} style={{ color: accent }} />
            <h1 className="text-2xl font-semibold tracking-wide">Customers</h1>
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--app-muted, #8B7663)' }}>
            Everyone who registered or was added by you.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-85"
          style={{ backgroundColor: accent }}
        >
          <Plus size={16} aria-hidden="true" /> Add Customer
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border p-5" style={panelStyle}>
          <div>
            <p className="text-sm text-[#8B7663]">Total Customers</p>
            <p className="mt-2 text-2xl font-semibold">{list.length}</p>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: `${accent}20`, color: accent }}>
            <Users size={21} />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-5" style={panelStyle}>
          <div>
            <p className="text-sm text-[#8B7663]">Biometrics Enabled</p>
            <p className="mt-2 text-2xl font-semibold">{withBiometrics}</p>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: `${accent}20`, color: accent }}>
            <Fingerprint size={21} />
          </div>
        </div>
      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-lg border" style={panelStyle}>
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: `${accent}66` }}>
          <div
            className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 sm:max-w-sm"
            style={{ borderColor: `${accent}66` }}
          >
            <Search size={16} style={{ color: accent }} />
            <label htmlFor="search-customers" className="sr-only">Search customers</label>
            <input
              id="search-customers"
              type="search"
              placeholder="Search name, email, username, phone..."
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <span className="text-xs" style={{ color: accent }}>{filtered.length} customer(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Customer list</caption>
            <thead
              className="text-left text-xs uppercase tracking-wider"
              style={{ backgroundColor: 'var(--panel-head, #f4f1ea)', color: 'var(--panel-head-text, #a18b69)' }}
            >
              <tr>
                <th scope="col" className="px-5 py-4">Customer</th>
                <th scope="col" className="px-5 py-4">Biometrics</th>
                <th scope="col" className="px-5 py-4">Email</th>
                <th scope="col" className="px-5 py-4">Phone</th>
                <th scope="col" className="px-5 py-4">Address</th>
                <th scope="col" className="px-5 py-4">Orders</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#8B7663]">
                    {list.length === 0
                      ? 'No customers yet. New sign-ups appear here automatically.'
                      : 'No customers match your search.'}
                  </td>
                </tr>
              )}
              {filtered.map(c => (
                <tr key={c.id} className="border-t transition hover:bg-black/[0.02]" style={{ borderColor: `${accent}30` }}>
                  <td className="px-5 py-4">
                    <p className="font-medium">{c.title ? `${c.title} ` : ''}{c.full_name}</p>
                    <p className="text-xs text-[#8B7663]">
                      {c.username ? `@${c.username}` : 'Added by admin'}
                      {c.preferred_name ? ` · prefers “${c.preferred_name}”` : ''}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    {c.username ? (
                      <BiometricBadge enabled={c.biometric_enabled} />
                    ) : (
                      <span className="text-xs text-[#8B7663]">No account</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs">{c.email || '—'}</td>
                  <td className="px-5 py-4 text-xs">{c.phone || '—'}</td>
                  <td className="px-5 py-4 text-xs">{c.address || <span className="text-[#8B7663]">Not added yet</span>}</td>
                  <td className="px-5 py-4 font-semibold">{c.order_count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="customer-form-title"
        >
          <form
            onSubmit={save}
            noValidate
            className="my-8 w-full max-w-xl space-y-3 rounded-lg bg-white p-6 text-[#292725] shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 id="customer-form-title" className="text-lg font-bold">Add Customer</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1 text-gray-500 hover:text-gray-800"
                aria-label="Close customer form"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div>
              <label htmlFor="c-name" className="mb-1 block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                id="c-name"
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                className={inputClass('full_name')}
                required
              />
              {errors.full_name && <p role="alert" className="mt-1 text-xs text-red-700">{errors.full_name}</p>}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="c-pref" className="mb-1 block text-sm font-medium text-gray-700">Preferred Name</label>
                <input
                  id="c-pref"
                  value={form.preferred_name}
                  onChange={e => setForm({ ...form, preferred_name: e.target.value })}
                  className={inputClass('preferred_name')}
                />
              </div>
              <div>
                <label htmlFor="c-title" className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <select
                  id="c-title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className={inputClass('title')}
                >
                  {TITLES.map(t => <option key={t} value={t}>{t || '— None —'}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="c-gender" className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
                <select
                  id="c-gender"
                  value={form.gender}
                  onChange={e => setForm({ ...form, gender: e.target.value })}
                  className={inputClass('gender')}
                >
                  <option value="">— Prefer not to say —</option>
                  {GENDERS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="c-email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="c-email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className={inputClass('email')}
                />
                {errors.email && <p role="alert" className="mt-1 text-xs text-red-700">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="c-phone" className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <input
                  id="c-phone"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className={inputClass('phone')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="c-address" className="mb-1 block text-sm font-medium text-gray-700">Address</label>
              <textarea
                id="c-address"
                rows="2"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className={inputClass('address')}
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-85"
                style={{ backgroundColor: accent }}
              >
                Save Customer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}