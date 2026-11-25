import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin, Calendar, ShieldCheck, Phone, Fingerprint, ChevronDown, LogOut,
  Package, Plus, Trash2, Pencil, Check, X,
} from 'lucide-react'
import { api } from '../api'
import { useCart } from '../context/CartContext'

const peso = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatDate = (s) => {
  if (!s) return ''
  const d = new Date(s.replace(' ', 'T') + 'Z')
  return isNaN(d) ? s : d.toLocaleDateString('en-PH', { dateStyle: 'medium' })
}

const inputClass =
  'w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition'

const isValidPhone = (v) => /^(09\d{9}|\+639\d{9})$/.test(v.replace(/[\s-]/g, ''))

export default function StoreProfile() {
  const navigate = useNavigate()
  const { resetSession } = useCart()

  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [needsLogin, setNeedsLogin] = useState(false)
  const [message, setMessage] = useState(null) // { type, text }

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const [addingAddress, setAddingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState('')
  const [editingPhone, setEditingPhone] = useState(false)
  const [phone, setPhone] = useState('')

  useEffect(() => {
    api.profile()
      .then(p => { setProfile(p); setPhone(p.phone || '') })
      .catch(err => { if ((err.status === 401 || err.status === 403)) setNeedsLogin(true) })
    api.storeOrders().then(setOrders).catch(() => {})
  }, [])

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const flash = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3500)
  }

  const saveAddress = async () => {
    try {
      const updated = await api.addAddress(newAddress)
      setProfile(updated)
      setNewAddress('')
      setAddingAddress(false)
      flash('success', 'Address saved.')
    } catch (err) {
      flash('error', err.message)
    }
  }

  const removeAddress = async (id) => {
    if (!window.confirm('Remove this address?')) return
    try {
      setProfile(await api.deleteAddress(id))
    } catch (err) {
      flash('error', err.message)
    }
  }

  const savePhone = async () => {
    if (phone.trim() && !isValidPhone(phone)) {
      return flash('error', 'Enter a valid mobile number, for example 09123456789.')
    }
    try {
      const updated = await api.updateProfile({ phone: phone.trim() })
      setProfile(updated)
      setEditingPhone(false)
      flash('success', 'Phone number saved.')
    } catch (err) {
      flash('error', err.message)
    }
  }

  const logout = async () => {
    try { await api.logout() } catch { /* ignore */ }
    resetSession()
    navigate('/store-auth')
  }

  if (needsLogin) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center space-y-4">
        <p className="text-white font-semibold">Please sign in to view your profile.</p>
        <Link to="/store-auth" style={{ backgroundColor: '#8F5A1D' }} className="inline-block text-white px-6 py-3 rounded-xl text-xs font-bold tracking-wider">
          SIGN IN
        </Link>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const initial = (profile.first_name || profile.username || '?').charAt(0).toUpperCase()

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Account menu */}
      <div className="flex justify-end">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white hover:border-slate-500 transition"
          >
            <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">{initial}</span>
            {profile.first_name}
            <ChevronDown size={14} className="text-slate-300" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
              <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-300 hover:bg-slate-700/60 transition">
                <LogOut size={15} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div
          role="status"
          className={`p-3 rounded-xl text-sm border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
            <div className="relative w-24 h-24 mx-auto">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white">
                {initial}
              </div>
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-slate-800" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">{profile.full_name}</h2>
            <p className="text-xs text-blue-300 font-mono">@{profile.username}</p>

            <div className="mt-6 pt-5 border-t border-slate-700 space-y-4 text-sm text-left">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300"><Calendar size={15} /> Member since</span>
                <span className="text-white font-medium">{profile.member_since || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300"><ShieldCheck size={15} /> Account role</span>
                <span className="text-[10px] font-bold tracking-wider px-2 py-1 rounded bg-blue-500/15 text-blue-300 uppercase">{profile.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300"><Fingerprint size={15} /> Biometrics</span>
                <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded uppercase ${
                  profile.biometric_enabled ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-600/30 text-slate-300'
                }`}>
                  {profile.biometric_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="pt-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-300"><Phone size={15} /> Phone</span>
                  {!editingPhone && (
                    <button onClick={() => setEditingPhone(true)} className="text-slate-300 hover:text-white" aria-label="Edit phone number">
                      <Pencil size={14} />
                    </button>
                  )}
                </div>
                {editingPhone ? (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="09123456789"
                      className={inputClass}
                    />
                    <button onClick={savePhone} className="px-3 rounded-xl bg-blue-600 text-white" aria-label="Save phone"><Check size={16} /></button>
                    <button onClick={() => { setEditingPhone(false); setPhone(profile.phone || '') }} className="px-3 rounded-xl bg-slate-700 text-slate-200" aria-label="Cancel"><X size={16} /></button>
                  </div>
                ) : (
                  <p className="mt-1 text-white font-medium">{profile.phone || <span className="text-slate-400 font-normal">Not added yet</span>}</p>
                )}
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin size={16} className="text-indigo-400" /> My Addresses
              </h3>
              {!addingAddress && (
                <button onClick={() => setAddingAddress(true)} className="flex items-center gap-1 text-xs text-indigo-300 font-semibold hover:underline">
                  <Plus size={14} /> Add
                </button>
              )}
            </div>

            {profile.addresses.length === 0 && !addingAddress && (
              <p className="text-xs text-slate-400">You haven't added an address yet. Add one here or during checkout.</p>
            )}

            <div className="space-y-2">
              {profile.addresses.map(a => (
                <div key={a.id} className="flex items-start justify-between gap-3 bg-slate-900/60 border border-slate-700 rounded-xl p-3">
                  <p className="text-sm text-slate-100">{a.address}</p>
                  <button onClick={() => removeAddress(a.id)} className="text-slate-400 hover:text-red-400 shrink-0" aria-label="Remove address">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {addingAddress && (
              <div className="space-y-3">
                <textarea
                  rows={2}
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  placeholder="House no., street, barangay, city"
                  className={inputClass}
                />
                <div className="flex gap-2">
                  <button onClick={saveAddress} style={{ backgroundColor: '#8F5A1D' }} className="text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition">
                    Save Address
                  </button>
                  <button onClick={() => { setAddingAddress(false); setNewAddress('') }} className="text-slate-300 px-3 py-2 text-xs hover:underline">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">All Ordered Products</h3>
              <p className="text-xs text-slate-300 mt-0.5">Review your past purchases and fulfillment statuses.</p>
            </div>
            <span className="bg-blue-600/20 text-blue-300 text-xs px-3 py-1.5 rounded-full font-bold">{orders.length} Total Orders</span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-16 text-center space-y-2">
              <Package className="mx-auto text-slate-500" size={44} />
              <p className="text-sm font-semibold text-slate-200">No orders placed yet</p>
              <p className="text-xs text-slate-400">Items you purchase will appear here.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-bold text-blue-300">{order.order_number}</span>
                  <span className="text-slate-400">{formatDate(order.order_date)}</span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold">{order.order_status}</span>
                </div>
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <img
                      src={it.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'}
                      alt={it.product_name}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{it.product_name}</p>
                      <p className="text-xs text-slate-300">Qty {it.quantity} × {peso(it.price)}</p>
                    </div>
                  </div>
                ))}
                <p className="text-right text-sm text-slate-300 border-t border-slate-700 pt-2">
                  Total <span className="font-bold text-blue-300">{peso(order.total)}</span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}