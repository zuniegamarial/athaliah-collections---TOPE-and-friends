
import { useEffect, useState } from 'react'
import {
  Users,
  Plus,
  X,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Search,
} from 'lucide-react'
import { api } from '../api'
import Notification from '../components/Notification'

const empty = {
  full_name: '',
  preferred_name: '',
  title: '',
  gender: '',
  email: '',
  phone: '',
  address: '',
}

const GENDERS = ['Woman', 'Man', 'Non-binary', 'Self-describe', 'Prefer not to say']
const TITLES = ['', 'Mr.', 'Ms.', 'Mrs.', 'Mx.', 'Dr.', 'Prof.', 'Self-describe']

export default function Customers() {
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)
  const [search, setSearch] = useState('')

  const accent = 'var(--app-accent, #a18b69)'

  const panelStyle = {
    backgroundColor: 'white',
    borderColor: `${accent}66`,
  }

  const dividerStyle = {
    borderColor: `${accent}40`,
  }

  const load = () => api.customers().then(setList).catch(() => {})

  useEffect(() => {
    load()
  }, [])

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
    `w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 ${
      errors[field] ? 'border-red-500' : ''
    }`

  const inputStyle = (field) => ({
    borderColor: errors[field] ? undefined : `${accent}80`,
    '--tw-ring-color': `${accent}40`,
  })

  const filtered = list.filter(c => {
    const term = search.toLowerCase()
    return (
      (c.full_name || '').toLowerCase().includes(term) ||
      (c.preferred_name || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.phone || '').toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6 text-[#292725]">

      {notice && (
        <Notification {...notice} onClose={() => setNotice(null)} />
      )}

      {/* Heading */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users size={21} style={{ color: accent }} />
            <h1 className="text-2xl font-semibold tracking-wide">
              Customers
            </h1>
          </div>
          <p className="mt-1 text-sm text-[#8B7663]">
            Manage your customer information and contact details.
          </p>
        </div>

        <button
          onClick={() => {
            setForm(empty)
            setErrors({})
            setShowForm(true)
          }}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-85"
          style={{ backgroundColor: accent }}
        >
          <Plus size={17} />
          Add Customer
        </button>
      </header>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          className="flex items-center justify-between rounded-lg border p-5"
          style={panelStyle}
        >
          <div>
            <p className="text-sm text-[#8B7663]">Total Customers</p>
            <p className="mt-2 text-2xl font-semibold">{list.length}</p>
          </div>
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: `${accent}20`, color: accent }}
          >
            <Users size={22} />
          </div>
        </div>

        <div
          className="flex items-center justify-between rounded-lg border p-5"
          style={panelStyle}
        >
          <div>
            <p className="text-sm text-[#8B7663]">Customers with Email</p>
            <p className="mt-2 text-2xl font-semibold">
              {list.filter(c => c.email).length}
            </p>
          </div>
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: `${accent}20`, color: accent }}
          >
            <Mail size={22} />
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <section
        className="overflow-hidden rounded-lg border"
        style={panelStyle}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b p-5"
          style={dividerStyle}
        >
          <div>
            <h2 className="font-semibold">Customer Directory</h2>
            <p className="mt-1 text-xs text-[#8B7663]">
              View registered customer information.
            </p>
          </div>

          <span className="text-xs" style={{ color: accent }}>
            {filtered.length} customer(s)
          </span>
        </div>

        {/* Search */}
        <div className="border-b p-4" style={dividerStyle}>
          <div
            className="flex items-center gap-2 rounded-lg border px-3 py-2.5 sm:max-w-md"
            style={{ borderColor: `${accent}66` }}
          >
            <Search size={16} style={{ color: accent }} />
            <label htmlFor="customer-search" className="sr-only">
              Search customers
            </label>
            <input
              id="customer-search"
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, or phone..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Customer list</caption>

            <thead
              className="text-left text-xs uppercase tracking-wider"
              style={{
                backgroundColor: `${accent}18`,
                color: accent,
              }}
            >
              <tr>
                <th scope="col" className="px-5 py-4">Full Name</th>
                <th scope="col" className="px-5 py-4">Preferred</th>
                <th scope="col" className="px-5 py-4">Title</th>
                <th scope="col" className="px-5 py-4">Gender</th>
                <th scope="col" className="px-5 py-4">Email</th>
                <th scope="col" className="px-5 py-4">Phone</th>
                <th scope="col" className="px-5 py-4">Address</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Users size={28} className="mx-auto mb-2" style={{ color: accent }} />
                    <p className="font-medium text-[#6F5C4B]">
                      No customers found
                    </p>
                    <p className="mt-1 text-xs text-[#8B7663]">
                      Add a customer or try a different search.
                    </p>
                  </td>
                </tr>
              )}

              {filtered.map(c => (
                <tr
                  key={c.id}
                  className="border-t transition hover:bg-black/[0.02]"
                  style={dividerStyle}
                >
                  <td className="whitespace-nowrap px-5 py-4 font-medium">
                    {c.full_name}
                  </td>
                  <td className="px-5 py-4">{c.preferred_name || '—'}</td>
                  <td className="px-5 py-4">{c.title || '—'}</td>
                  <td className="px-5 py-4">{c.gender || '—'}</td>
                  <td className="px-5 py-4 text-xs">{c.email || '—'}</td>
                  <td className="px-5 py-4 text-xs">{c.phone || '—'}</td>
                  <td className="max-w-xs px-5 py-4 text-xs">
                    {c.address || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Customer Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="customer-form-title"
        >
          <form
            onSubmit={save}
            noValidate
            className="my-8 w-full max-w-2xl space-y-5 rounded-xl border bg-white p-6 shadow-xl"
            style={panelStyle}
          >
            <div
              className="flex items-center justify-between border-b pb-4"
              style={dividerStyle}
            >
              <div>
                <div className="flex items-center gap-2">
                  <UserPlus size={20} style={{ color: accent }} />
                  <h2 id="customer-form-title" className="text-lg font-semibold">
                    Add New Customer
                  </h2>
                </div>
                <p className="mt-1 text-xs text-[#8B7663]">
                  Enter the customer's information below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 transition hover:bg-black/5"
                style={{ color: accent }}
                aria-label="Close customer form"
              >
                <X size={19} />
              </button>
            </div>

            {/* Name Information */}
            <div className="space-y-3">
              <h3
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: accent }}
              >
                Personal Information
              </h3>

              <div>
                <label htmlFor="c-name" className="mb-1 block text-sm font-medium">
                  Full Name *
                </label>
                <input
                  id="c-name"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  className={inputClass('full_name')}
                  style={inputStyle('full_name')}
                  required
                />
                {errors.full_name && (
                  <p role="alert" className="mt-1 text-xs text-red-700">
                    {errors.full_name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="c-pref" className="mb-1 block text-sm font-medium">
                    Preferred Name
                  </label>
                  <input
                    id="c-pref"
                    value={form.preferred_name}
                    onChange={e => setForm({ ...form, preferred_name: e.target.value })}
                    className={inputClass('preferred_name')}
                    style={inputStyle('preferred_name')}
                  />
                </div>

                <div>
                  <label htmlFor="c-title" className="mb-1 block text-sm font-medium">
                    Title
                  </label>
                  <select
                    id="c-title"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className={inputClass('title')}
                    style={inputStyle('title')}
                  >
                    {TITLES.map(t => (
                      <option key={t} value={t}>{t || '— None —'}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="c-gender" className="mb-1 block text-sm font-medium">
                    Gender
                  </label>
                  <select
                    id="c-gender"
                    value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                    className={inputClass('gender')}
                    style={inputStyle('gender')}
                  >
                    <option value="">— Prefer not to say —</option>
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3 border-t pt-4" style={dividerStyle}>
              <h3
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: accent }}
              >
                Contact Information
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-email" className="mb-1 flex items-center gap-1 text-sm font-medium">
                    <Mail size={14} style={{ color: accent }} /> Email
                  </label>
                  <input
                    id="c-email"
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className={inputClass('email')}
                    style={inputStyle('email')}
                  />
                </div>

                <div>
                  <label htmlFor="c-phone" className="mb-1 flex items-center gap-1 text-sm font-medium">
                    <Phone size={14} style={{ color: accent }} /> Phone
                  </label>
                  <input
                    id="c-phone"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className={inputClass('phone')}
                    style={inputStyle('phone')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="c-address" className="mb-1 flex items-center gap-1 text-sm font-medium">
                  <MapPin size={14} style={{ color: accent }} /> Address
                </label>
                <textarea
                  id="c-address"
                  rows={3}
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className={inputClass('address')}
                  style={inputStyle('address')}
                />
              </div>
            </div>

            {/* Form Buttons */}
            <div
              className="flex justify-end gap-2 border-t pt-4"
              style={dividerStyle}
            >
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border px-4 py-2.5 text-sm transition hover:opacity-70"
                style={{ borderColor: accent, color: accent }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-85"
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
