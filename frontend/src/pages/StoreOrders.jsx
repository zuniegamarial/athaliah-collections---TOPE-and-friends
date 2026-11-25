import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Package, Clock, Truck, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { api } from '../api'

const peso = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatDate = (s) => {
  if (!s) return 'Recent'
  const d = new Date(s.replace(' ', 'T') + 'Z') // server stores UTC
  return isNaN(d) ? s : d.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
}

const STATUS_STYLE = {
  Pending:    { cls: 'bg-amber-500/10 border-amber-500/30 text-amber-300',     icon: Clock },
  Processing: { cls: 'bg-blue-500/10 border-blue-500/30 text-blue-300',        icon: Loader2 },
  Shipped:    { cls: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',  icon: Truck },
  Delivered:  { cls: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300', icon: CheckCircle2 },
  Cancelled:  { cls: 'bg-red-500/10 border-red-500/30 text-red-300',           icon: XCircle },
  Refunded:   { cls: 'bg-slate-500/10 border-slate-500/30 text-slate-300',     icon: XCircle },
}

const TABS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

export default function StoreOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [needsLogin, setNeedsLogin] = useState(false)
  const [activeTab, setActiveTab] = useState('All')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(() => {
    api.storeOrders()
      .then(data => { setOrders(Array.isArray(data) ? data : []); setError('') })
      .catch(err => {
        if ((err.status === 401 || err.status === 403)) setNeedsLogin(true)
        else setError('Could not load your orders. Is the backend running?')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const cancelOrder = async (id) => {
    if (!window.confirm('Cancel this order?')) return
    setBusyId(id)
    try {
      await api.cancelStoreOrder(id)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const filtered = orders.filter(o => activeTab === 'All' || o.order_status === activeTab)

  if (needsLogin) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center space-y-4">
        <p className="text-white font-semibold">Please sign in to see your orders.</p>
        <Link to="/store-auth" style={{ backgroundColor: '#8F5A1D' }} className="inline-block text-white px-6 py-3 rounded-xl text-xs font-bold tracking-wider">
          SIGN IN
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <ClipboardList className="text-blue-400" size={22} /> My Orders
          </h2>
          <p className="text-xs text-slate-300 mt-1">Track your orders and their delivery status.</p>
        </div>
        <span className="bg-blue-600/20 text-blue-300 text-xs px-3 py-1 rounded-xl font-bold">{orders.length} Total</span>
      </div>

      <div className="bg-slate-800 border border-slate-700 p-1.5 rounded-2xl flex gap-1.5 overflow-x-auto">
        {TABS.map(tab => {
          const count = tab === 'All' ? orders.length : orders.filter(o => o.order_status === tab).length
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={activeTab === tab ? { backgroundColor: '#8F5A1D' } : {}}
              className={`flex-1 whitespace-nowrap px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === tab ? 'text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab} {count > 0 && <span className="opacity-70">({count})</span>}
            </button>
          )
        })}
      </div>

      {error && (
        <div role="alert" className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-16 text-center space-y-3">
          <Package className="mx-auto text-slate-500 mb-2" size={48} />
          <p className="text-sm font-semibold text-slate-200">
            {activeTab === 'All' ? 'No orders yet' : `No ${activeTab.toLowerCase()} orders`}
          </p>
          <p className="text-xs text-slate-400">Orders you place will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const st = STATUS_STYLE[order.order_status] || STATUS_STYLE.Pending
            const StatusIcon = st.icon
            return (
              <div key={order.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4 hover:border-blue-500/50 transition">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-blue-300 font-bold">{order.order_number}</span>
                    <span className="text-[11px] text-slate-400">• {formatDate(order.order_date)}</span>
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-semibold text-xs ${st.cls}`}>
                    <StatusIcon size={14} /> {order.order_status}
                  </span>
                </div>

                <div className="space-y-3">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img
                        src={it.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'}
                        alt={it.product_name}
                        className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{it.product_name}</p>
                        <p className="text-xs text-slate-300">Qty {it.quantity} × {peso(it.price)}</p>
                      </div>
                      <span className="text-sm font-bold text-blue-300">{peso(it.quantity * it.price)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-700 pt-3">
                  <div className="text-xs text-slate-300 space-y-0.5">
                    <p>Payment: <span className="text-white font-semibold">{order.payment_method}</span> · {order.payment_status}</p>
                    {order.shipping_address && <p>Ship to: <span className="text-white">{order.shipping_address}</span></p>}
                    {order.tracking_number && <p>Tracking: <span className="text-white font-mono">{order.tracking_number}</span></p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {order.order_status === 'Pending' && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        disabled={busyId === order.id}
                        className="text-xs text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition disabled:opacity-50"
                      >
                        {busyId === order.id ? 'Cancelling...' : 'Cancel order'}
                      </button>
                    )}
                    <p className="text-sm text-slate-300">Total <span className="font-bold text-blue-300 text-base ml-1">{peso(order.total)}</span></p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}