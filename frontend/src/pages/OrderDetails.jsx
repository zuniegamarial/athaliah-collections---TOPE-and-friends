
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Truck,
  FileText,
  RotateCcw,
  DollarSign,
  Save,
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  Package,
} from 'lucide-react'
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

  const accent = 'var(--app-accent, #a18b69)'

  const panelStyle = {
    backgroundColor: 'white',
    borderColor: `${accent}66`,
  }

  const dividerStyle = {
    borderColor: `${accent}40`,
  }

  const inputStyle = {
    borderColor: `${accent}80`,
    '--tw-ring-color': `${accent}40`,
  }

  const actionButtonStyle = {
    borderColor: accent,
    color: accent,
    backgroundColor: `${accent}10`,
  }

  const load = () =>
    api.order(id)
      .then(o => {
        setOrder(o)
        setStatus(o.order_status)
        setTracking(o.tracking_number || '')
      })
      .catch(() => setNotice({ type: 'error', message: 'Order not found.' }))

  useEffect(() => { load() }, [id])

  if (!order) {
    return (
      <div
        className="rounded-lg border p-8 text-center text-sm text-[#8B7663]"
        style={panelStyle}
      >
        Loading order...
      </div>
    )
  }

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
    <div className="space-y-6 text-[#292725]">

      {notice && (
        <Notification {...notice} onClose={() => setNotice(null)} />
      )}

      {/* Back Button */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm font-medium transition hover:opacity-70"
        style={{ color: accent }}
      >
        <ArrowLeft size={16} />
        Back to Orders
      </Link>

      {/* Order Header */}
      <section
        className="rounded-lg border p-5"
        style={panelStyle}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p
              className="text-xs font-medium tracking-[0.18em]"
              style={{ color: accent }}
            >
              ORDER DETAILS
            </p>
            <h1 className="mt-2 text-2xl font-semibold">
              {order.order_number}
            </h1>
            <p className="mt-1 text-sm text-[#8B7663]">
              Placed: {order.order_date}
            </p>
          </div>

          <OrderStatusBadge status={order.order_status} />
        </div>
      </section>

      {/* Main Information */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Order Items */}
        <section
          aria-labelledby="items-heading"
          className="overflow-hidden rounded-lg border lg:col-span-2"
          style={panelStyle}
        >
          <header
            className="flex items-center gap-2 border-b px-5 py-4"
            style={dividerStyle}
          >
            <ShoppingBag size={18} style={{ color: accent }} />
            <h2 id="items-heading" className="font-semibold">
              Ordered Items
            </h2>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Order items</caption>
              <thead
                className="text-left text-xs uppercase tracking-wider"
                style={{
                  backgroundColor: `${accent}18`,
                  color: accent,
                }}
              >
                <tr>
                  <th scope="col" className="px-5 py-3">Product</th>
                  <th scope="col" className="px-5 py-3">Variant</th>
                  <th scope="col" className="px-5 py-3">Qty</th>
                  <th scope="col" className="px-5 py-3">Price</th>
                  <th scope="col" className="px-5 py-3 text-right">Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {order.items.map(it => (
                  <tr
                    key={it.id}
                    className="border-t"
                    style={dividerStyle}
                  >
                    <td className="px-5 py-4 font-medium">
                      {it.product_name}
                    </td>
                    <td className="px-5 py-4 text-[#8B7663]">
                      {it.variant_label || '—'}
                    </td>
                    <td className="px-5 py-4">{it.quantity}</td>
                    <td className="whitespace-nowrap px-5 py-4">
                      ₱{Number(it.price).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-medium">
                      ₱{(it.price * it.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr
                  className="border-t"
                  style={{
                    ...dividerStyle,
                    backgroundColor: `${accent}18`,
                  }}
                >
                  <td colSpan={4} className="px-5 py-4 text-right font-semibold">
                    Order Total
                  </td>
                  <td
                    className="whitespace-nowrap px-5 py-4 text-right font-bold"
                    style={{ color: accent }}
                  >
                    ₱{Number(order.total).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Customer Information */}
        <section
          className="space-y-4 rounded-lg border p-5"
          style={panelStyle}
        >
          <div
            className="flex items-center gap-2 border-b pb-3"
            style={dividerStyle}
          >
            <User size={18} style={{ color: accent }} />
            <h2 className="font-semibold">Customer Information</h2>
          </div>

          <div>
            <p className="text-xs text-[#8B7663]">Customer Name</p>
            <p className="mt-1 font-medium">{order.customer}</p>
          </div>

          {order.customer_email && (
            <div>
              <p className="text-xs text-[#8B7663]">Email Address</p>
              <p className="mt-1 break-all text-sm">{order.customer_email}</p>
            </div>
          )}

          {order.customer_phone && (
            <div>
              <p className="text-xs text-[#8B7663]">Contact Number</p>
              <p className="mt-1 text-sm">{order.customer_phone}</p>
            </div>
          )}

          {order.customer_address && (
            <div>
              <p className="flex items-center gap-1 text-xs text-[#8B7663]">
                <MapPin size={13} style={{ color: accent }} /> Shipping Address
              </p>
              <p className="mt-1 whitespace-pre-line text-sm">
                {order.customer_address}
              </p>
            </div>
          )}

          <div className="border-t pt-4" style={dividerStyle}>
            <div className="mb-2 flex items-center gap-2">
              <CreditCard size={17} style={{ color: accent }} />
              <h3 className="font-semibold">Payment Information</h3>
            </div>
            <p className="text-xs text-[#8B7663]">Payment Status</p>
            <p className="mt-1 font-medium">{order.payment_status}</p>
          </div>
        </section>
      </div>

      {/* Order Actions */}
      <section
        aria-labelledby="actions-heading"
        className="space-y-5 rounded-lg border p-5"
        style={panelStyle}
      >
        <div
          className="flex items-center gap-2 border-b pb-4"
          style={dividerStyle}
        >
          <Package size={19} style={{ color: accent }} />
          <h2 id="actions-heading" className="font-semibold">
            Order Management
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* Update Status */}
          <div>
            <label
              htmlFor="order-status"
              className="mb-2 block text-sm font-medium"
            >
              Update Order Status
            </label>

            <select
              id="order-status"
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
              style={inputStyle}
            >
              {STATUSES.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <button
              onClick={saveStatus}
              className="mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-85"
              style={{ backgroundColor: accent }}
            >
              <Save size={16} />
              Update Status
            </button>
          </div>

          {/* Tracking Number */}
          <div>
            <label
              htmlFor="order-tracking"
              className="mb-2 block text-sm font-medium"
            >
              Tracking Number
            </label>

            <input
              id="order-tracking"
              value={tracking}
              onChange={e => setTracking(e.target.value)}
              placeholder="e.g. ATH-2026-0001"
              className="w-full rounded-lg border px-3 py-2.5 font-mono text-sm outline-none focus:ring-2"
              style={inputStyle}
            />

            <button
              onClick={saveTracking}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:opacity-70"
              style={actionButtonStyle}
            >
              <Truck size={16} />
              Save Tracking
            </button>
          </div>
        </div>

        {/* Additional Actions */}
        <div
          className="flex flex-wrap gap-3 border-t pt-5"
          style={dividerStyle}
        >
          <button
            onClick={generateLabel}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:opacity-70"
            style={actionButtonStyle}
          >
            <FileText size={16} />
            Generate Shipping Label
          </button>

          <button
            onClick={refund}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:opacity-70"
            style={actionButtonStyle}
          >
            <DollarSign size={16} />
            Process Refund
          </button>

          <button
            onClick={refund}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:opacity-70"
            style={actionButtonStyle}
          >
            <RotateCcw size={16} />
            Process Return
          </button>
        </div>

        {/* Shipping Label Result */}
        {labelInfo && (
          <div
            role="status"
            className="space-y-2 rounded-lg border p-4 text-sm"
            style={{
              borderColor: accent,
              backgroundColor: `${accent}15`,
            }}
          >
            <p className="font-semibold">{labelInfo.message}</p>
            <p>
              Order: <strong>{labelInfo.order_number}</strong>
            </p>
            <p>
              Tracking Number:{' '}
              <strong className="font-mono">
                {labelInfo.tracking_number}
              </strong>
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
