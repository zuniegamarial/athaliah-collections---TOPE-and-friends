import { useEffect, useState } from 'react'
import { Users, Plus, X } from 'lucide-react'
import { api } from '../api'
import Notification from '../components/Notification'

const empty = {
  full_name: '', preferred_name: '', title: '', gender: '',
  email: '', phone: '', address: '',
}

const GENDERS = ['Woman', 'Man', 'Non-binary', 'Self-describe', 'Prefer not to say']
const TITLES = ['', 'Mr.', 'Ms.', 'Mrs.', 'Mx.', 'Dr.', 'Prof.', 'Self-describe']

export default function Customers() {
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)

  const load = () => api.customers().then(setList).catch(() => {})
  useEffect(() => { load() }, [])

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
    `w-full border rounded px-3 py-2 ${errors[field] ? 'border-red-500' : 'border-gray-300'}`

  return (
    <div className="space-y-4">
      {notice && <Notification {...notice} onClose={() => setNotice(null)} />}

      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-brand-600" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-gray-800">Customers</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded font-medium"
        >
          <Plus size={16} aria-hidden="true" /> Add Customer
        </button>
      </header>

      <div className="bg-white rounded shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Customer list</caption>
          <thead className="bg-gray-50 text-left text-gray-600 uppercase text-xs">
            <tr>
              <th scope="col" className="px-4 py-2">Full Name</th>
              <th scope="col" className="px-4 py-2">Preferred</th>
              <th scope="col" className="px-4 py-2">Title</th>
              <th scope="col" className="px-4 py-2">Gender</th>
              <th scope="col" className="px-4 py-2">Email</th>
              <th scope="col" className="px-4 py-2">Phone</th>
              <th scope="col" className="px-4 py-2">Address</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No customers yet. Click “Add Customer” to create one.
                </td>
              </tr>
            )}
            {list.map(c => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">{c.full_name}</td>
                <td className="px-4 py-3">{c.preferred_name || '—'}</td>
                <td className="px-4 py-3">{c.title || '—'}</td>
                <td className="px-4 py-3">{c.gender || '—'}</td>
                <td className="px-4 py-3 text-xs">{c.email || '—'}</td>
                <td className="px-4 py-3 text-xs">{c.phone || '—'}</td>
                <td className="px-4 py-3 text-xs">{c.address || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-start justify-center overflow-y-auto p-4 z-40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="customer-form-title"
        >
          <form onSubmit={save} noValidate className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6 space-y-3 my-8">
            <div className="flex items-center justify-between">
              <h2 id="customer-form-title" className="text-lg font-bold text-gray-800">Add Customer</h2>
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
              <label htmlFor="c-name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="c-name"
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                className={inputClass('full_name')}
                required
              />
              {errors.full_name && (
                <p role="alert" className="text-xs text-red-700 mt-1">{errors.full_name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="c-pref" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Name
                </label>
                <input
                  id="c-pref"
                  value={form.preferred_name}
                  onChange={e => setForm({ ...form, preferred_name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="c-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <select
                  id="c-title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {TITLES.map(t => <option key={t} value={t}>{t || '— None —'}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="c-gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  id="c-gender"
                  value={form.gender}
                  onChange={e => setForm({ ...form, gender: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">— Prefer not to say —</option>
                  {GENDERS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="c-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="c-email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="c-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  id="c-phone"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="c-address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="c-address"
                rows="2"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded font-medium"
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