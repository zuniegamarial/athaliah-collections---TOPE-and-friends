
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingCart,
  Search,
  Eye,
  ClipboardList,
  Clock,
  Truck,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'
import { api } from '../api'
import { OrderStatusBadge } from '../components/StatusBadge'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')

  const accent = 'var(--app-accent, #a18b69)'

  const panelStyle = {
    backgroundColor: 'white',
    borderColor: `${accent}66`,
  }

  useEffect(() => {
    api.orders().then(setOrders).catch(() => {})
  }, [])

  const filtered = orders.filter(o => {
    const matchesQ =
      !q ||
      (o.order_number || '').toLowerCase().includes(q.toLowerCase()) ||
      (o.customer || '').toLowerCase().includes(q.toLowerCase())

    const matchesStatus =
      status === 'all' || o.order_status === status

    return matchesQ && matchesStatus
  })

  const summary = [
    {
      label: 'Total Orders',
      value: orders.length,
      icon: ClipboardList,
    },
    {
      label: 'Pending',
      value: orders.filter(o => o.order_status === 'Pending').length,
      icon: Clock,
    },
    {
      label: 'Shipped',
      value: orders.filter(o => o.order_status === 'Shipped').length,
      icon: Truck,
    },
    {
      label: 'Delivered',
      value: orders.filter(o => o.order_status === 'Delivered').length,
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="space-y-6 text-[#292725]">

      {/* Page Heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart size={21} style={{ color: accent }} />
            <h1 className="text-2xl font-semibold tracking-wide">
              Orders
            </h1>
          </div>
          <p className="mt-1 text-sm text-[#8B7663]">
            Manage and monitor customer orders.
          </p>
        </div>

        <span
          className="text-xs tracking-wider"
          style={{ color: accent }}
        >
          ORDER MANAGEMENT
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-lg border p-5"
            style={panelStyle}
          >
            <div>
              <p className="text-sm text-[#8B7663]">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </div>

            <div
              className="rounded-lg p-3"
              style={{
                backgroundColor: `${accent}20`,
                color: accent,
              }}
            >
              <Icon size={21} />
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <section
        className="overflow-hidden rounded-lg border"
        style={panelStyle}
      >

        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b p-5"
          style={{ borderColor: `${accent}66` }}
        >
          <div>
            <h2 className="font-semibold">All Orders</h2>
            <p className="mt-1 text-xs text-[#8B7663]">
              View and track customer purchases.
            </p>
          </div>

          <span className="text-xs" style={{ color: accent }}>
            {filtered.length} order(s) found
          </span>
        </div>

        {/* Search and Filter */}
        <div
          className="flex flex-col gap-3 border-b p-4 sm:flex-row"
          style={{ borderColor: `${accent}66` }}
        >
          <div
            className="flex flex-1 items-center gap-2 rounded-lg border px-3 py-2"
            style={{ borderColor: `${accent}66` }}
          >
            <Search size={16} style={{ color: accent }} />

            <label htmlFor="search-orders" className="sr-only">
              Search orders
            </label>

            <input
              id="search-orders"
              type="search"
              placeholder="Search order number or customer..."
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div>
            <label htmlFor="order-filter" className="sr-only">
              Filter orders by status
            </label>

            <select
              id="order-filter"
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none sm:w-48"
              style={{ borderColor: `${accent}66` }}
            >
              <option value="all">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">List of customer orders</caption>

            <thead
              className="text-left text-xs uppercase tracking-wider"
              style={{
                backgroundColor: `${accent}18`,
                color: accent,
              }}
            >
              <tr>
                <th scope="col" className="px-5 py-4">Order #</th>
                <th scope="col" className="px-5 py-4">Customer</th>
                <th scope="col" className="px-5 py-4">Date</th>
                <th scope="col" className="px-5 py-4">Total</th>
                <th scope="col" className="px-5 py-4">Payment</th>
                <th scope="col" className="px-5 py-4">Order Status</th>
                <th scope="col" className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <RotateCcw size={25} style={{ color: accent }} />
                      <p className="font-medium text-[#6F5C4B]">
                        No orders found
                      </p>
                      <p className="text-xs text-[#8B7663]">
                        Try changing your search or filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {filtered.map(o => (
                <tr
                  key={o.id}
                  className="border-t transition hover:bg-black/[0.02]"
                  style={{ borderColor: `${accent}30` }}
                >
                  <td
                    className="whitespace-nowrap px-5 py-4 font-mono font-medium"
                    style={{ color: accent }}
                  >
                    {o.order_number}
                  </td>

                  <td className="px-5 py-4 font-medium">
                    {o.customer}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-xs text-[#8B7663]">
                    {o.order_date}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 font-semibold">
                    ₱{Number(o.total).toLocaleString()}
                  </td>

                  <td className="px-5 py-4">
                    {o.payment_status}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <OrderStatusBadge status={o.order_status} />
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/orders/${o.id}`}
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition hover:opacity-70"
                      style={{
                        borderColor: accent,
                        color: accent,
                        backgroundColor: `${accent}10`,
                      }}
                      aria-label={`Open order ${o.order_number}`}
                    >
                      <Eye size={14} />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
