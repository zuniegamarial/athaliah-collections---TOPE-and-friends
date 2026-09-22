import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Search, Eye } from 'lucide-react'
import { api } from '../api'
import { OrderStatusBadge } from '../components/StatusBadge'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')

  useEffect(() => {
    api.orders().then(setOrders).catch(() => {})
  }, [])

  const filtered = orders.filter(o => {
    const matchesQ =
      !q ||
      o.order_number.toLowerCase().includes(q.toLowerCase()) ||
      (o.customer || '').toLowerCase().includes(q.toLowerCase())
    const matchesStatus = status === 'all' || o.order_status === status
    return matchesQ && matchesStatus
  })

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} className="text-brand-600" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-gray-800">Orders</h1>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-3 py-2 w-full sm:w-64">
            <Search size={16} className="text-gray-400" aria-hidden="true" />
            <label htmlFor="search-orders" className="sr-only">Search orders</label>
            <input
              id="search-orders"
              type="search"
              placeholder="Search order # or customer"
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="order-filter" className="sr-only">Filter orders by status</label>
            <select
              id="order-filter"
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
            >
              <option value="all">All statuses</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Refunded</option>
            </select>
          </div>
        </div>
      </header>

      <div className="bg-white rounded shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">List of orders</caption>
          <thead className="bg-gray-50 text-left text-gray-600 uppercase text-xs">
            <tr>
              <th scope="col" className="px-4 py-2">Order #</th>
              <th scope="col" className="px-4 py-2">Customer</th>
              <th scope="col" className="px-4 py-2">Date</th>
              <th scope="col" className="px-4 py-2">Total</th>
              <th scope="col" className="px-4 py-2">Payment</th>
              <th scope="col" className="px-4 py-2">Order Status</th>
              <th scope="col" className="px-4 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No orders match your filters.
                </td>
              </tr>
            )}
            {filtered.map(o => (
              <tr key={o.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-mono font-medium text-brand-700">{o.order_number}</td>
                <td className="px-4 py-3">{o.customer}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{o.order_date}</td>
                <td className="px-4 py-3 font-medium">₱{Number(o.total).toLocaleString()}</td>
                <td className="px-4 py-3">{o.payment_status}</td>
                <td className="px-4 py-3"><OrderStatusBadge status={o.order_status} /></td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/orders/${o.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1 border border-brand-600 text-brand-700 rounded text-xs hover:bg-brand-50"
                    aria-label={`Open order ${o.order_number}`}
                  >
                    <Eye size={12} aria-hidden="true" /> View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}