import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Truck, FileText, RotateCcw, DollarSign, Save } from 'lucide-react'
import { api } from '../api'
import Notification from '../components/Notification'
import { OrderStatusBadge } from '../components/StatusBadge'

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Refunded']

export default function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('')
  const [tracking, setTracking] = useState('')
  const [notice, setNotice] = useState(null)
  const [labelInfo, setLabelInfo] = useState(null)

  const load = () =>
    api.order(id)
      .then(o => {
        setOrder(o)
        setStatus(o.order_status)
        setTracking(o.tracking_number || '')
      })
      .catch(() => setNotice({ type: 'error', message: 'Order not found.' }))

  useEffect(() => { load() }, [id])

  if (!order) return <p>Loading order…</p>

  const saveStatus = async () => {
    try {
      await api.updateOrderStatus(id, status)
      setNotice({ type: 'success', message: `Order status updated to ${status}.` })
      load()
    } catch (err) {
      setNotice({ type: 'error', message: err.data?.error || err.message })
    }
  }

  const saveTracking = async () => {
    if (!tracking.trim()) {
      setNotice({ type: 'error', message: 'Tracking number is required.' })
      return
    }
    try {
      await api.addTracking(id, tracking.trim())
      setNotice({ type: 'success', message: 'Tracking number saved.' })
      load()
    } catch (err) {
      setNotice({ type: 'error', message: err.data?.error || err.message })
    }
  }

  const generateLabel = async () => {
    try {
      const res = await api.shippingLabel(id)
      setLabelInfo(res)
      setNotice({ type: 'success', message: res.message })
      load()
    } catch (err) {
      setNotice({ type: 'error', message: err.message })
    }
  }

  const refund = async () => {
    if (!window.confirm('Process a refund for this order? This marks the order as Refunded.')) return
    try {
      const res = await api.refundOrder(id)
      setNotice({ type: 'success', message: res.message })
      load()
    } catch (err) {
      setNotice({ type: 'error', message: err.message })
    }
  }

  return (
    <div className="space-y-5">
      {notice && <Notification {...notice} onClose={() => setNotice(null)} />}

      <Link to="/orders" className="inline-flex items-center gap-2 text-brand-700 hover:underline">
        <ArrowLeft size={16} aria-hidden="true" /> Back to Orders
      </Link>

      <header className="bg-white rounded shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order {order.order_number}</h1>
            <p className="text-sm text-gray-500">Placed: {order.order_date}</p>
          </div>
          <OrderStatusBadge status={order.order_status} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section aria-labelledby="items-heading" className="lg:col-span-2 bg-white rounded shadow-sm">
          <header className="px-5 py-3 border-b border-gray-200">
            <h2 id="items-heading" className="font-semibold text-gray-800">Items</h2>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Order items</caption>
              <thead className="bg-gray-50 text-left text-gray-600 uppercase text-xs">
                <tr>
                  <th scope="col" className="px-4 py-2">Product</th>
                  <th scope="col" className="px-4 py-2">Variant</th>
                  <th scope="col" className="px-4 py-2">Qty</th>
                  <th scope="col" className="px-4 py-2">Price</th>
                  <th scope="col" className="px-4 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(it => (
                  <tr key={it.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{it.product_name}</td>
                    <td className="px-4 py-3">{it.variant_label || '—'}</td>
                    <td className="px-4 py-3">{it.quantity}</td>
                    <td className="px-4 py-3">₱{Number(it.price).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      ₱{(it.price * it.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td colSpan={4} className="px-4 py-3 text-right font-semibold">Total</td>
                  <td className="px-4 py-3 text-right font-bold">
                    ₱{Number(order.total).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section aria-labelledby="customer-heading" className="bg-white rounded shadow-sm p-5 space-y-2">
          <h2 id="customer-heading" className="font-semibold text-gray-800">Customer</h2>
          <p className="font-medium text-gray-900">{order.customer}</p>
          {order.customer_email && <p className="text-sm text-gray-600">{order.customer_email}</p>}
          {order.customer_phone && <p className="text-sm text-gray-600">{order.customer_phone}</p>}
          {order.customer_address && (
            <p className="text-sm text-gray-600 whitespace-pre-line">{order.customer_address}</p>
          )}

          <div className="pt-3 border-t mt-3">
            <h3 className="font-semibold text-gray-800 mb-1">Payment</h3>
            <p className="text-sm">Status: <strong>{order.payment_status}</strong></p>
          </div>
        </section>
      </div>

      <section aria-labelledby="actions-heading" className="bg-white rounded shadow-sm p-5 space-y-4">
        <h2 id="actions-heading" className="font-semibold text-gray-800">Order Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="order-status" className="block text-sm font-medium text-gray-700 mb-1">
              Order Status
            </label>
            <select
              id="order-status"
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button
              onClick={saveStatus}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded font-medium"
            >
              <Save size={16} aria-hidden="true" /> Update Status
            </button>
          </div>

          <div>
            <label htmlFor="order-tracking" className="block text-sm font-medium text-gray-700 mb-1">
              Tracking Number
            </label>
            <input
              id="order-tracking"
              value={tracking}
              onChange={e => setTracking(e.target.value)}
              placeholder="e.g. ATH-2026-0001"
              className="w-full border border-gray-300 rounded px-3 py-2 font-mono"
            />
            <button
              onClick={saveTracking}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 border border-brand-600 text-brand-700 rounded hover:bg-brand-50 font-medium"
            >
              <Truck size={16} aria-hidden="true" /> Save Tracking
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t pt-4">
          <button
            onClick={generateLabel}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-400 rounded hover:bg-gray-50 font-medium"
          >
            <FileText size={16} aria-hidden="true" /> Generate Shipping Label
          </button>
          <button
            onClick={refund}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-500 text-red-700 rounded hover:bg-red-50 font-medium"
          >
            <DollarSign size={16} aria-hidden="true" /> Process Refund
          </button>
          <button
            onClick={refund}
            className="inline-flex items-center gap-2 px-4 py-2 border border-amber-500 text-amber-800 rounded hover:bg-amber-50 font-medium"
          >
            <RotateCcw size={16} aria-hidden="true" /> Process Return
          </button>
        </div>

        {labelInfo && (
          <div role="status" className="mt-3 border border-gray-300 bg-gray-50 rounded p-4 text-sm">
            <p className="font-semibold text-gray-800">{labelInfo.message}</p>
            <p>Order: <strong>{labelInfo.order_number}</strong></p>
            <p>Tracking Number: <strong className="font-mono">{labelInfo.tracking_number}</strong></p>
          </div>
        )}
      </section>
    </div>
  )
}