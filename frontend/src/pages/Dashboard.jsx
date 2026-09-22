import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingCart, Clock, AlertTriangle } from 'lucide-react'
import { api } from '../api'
import StatCard from '../components/StatCard'
import { OrderStatusBadge } from '../components/StatusBadge'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.dashboard().then(setData).catch(e => setError(e.message))
  }, [])

  if (error) return <p role="alert" className="text-red-700">{error}</p>
  if (!data) return <p>Loading dashboard…</p>

  return (
    <div className="space-y-6">
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Dashboard statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Products" value={data.total_products} />
          <StatCard label="Total Orders" value={data.total_orders} />
          <StatCard label="Pending Orders" value={data.pending_orders} />
          <StatCard label="Low Stock" value={data.low_stock_count} />
        </div>
      </section>

      <section aria-labelledby="recent-orders-heading" className="bg-white rounded shadow-sm">
        <header className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
          <ShoppingCart size={18} aria-hidden="true" className="text-brand-600" />
          <h2 id="recent-orders-heading" className="font-semibold text-gray-800">Recent Orders</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Recent orders table</caption>
            <thead className="bg-gray-50 text-left text-gray-600 uppercase text-xs">
              <tr>
                <th scope="col" className="px-4 py-2">Order #</th>
                <th scope="col" className="px-4 py-2">Customer</th>
                <th scope="col" className="px-4 py-2">Total</th>
                <th scope="col" className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_orders.map(o => (
                <tr key={o.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <Link to={`/orders/${o.id}`} className="text-brand-700 font-medium hover:underline">
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{o.customer}</td>
                  <td className="px-4 py-3">₱{Number(o.total).toLocaleString()}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={o.order_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="low-stock-heading" className="bg-white rounded shadow-sm">
        <header className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
          <AlertTriangle size={18} aria-hidden="true" className="text-amber-600" />
          <h2 id="low-stock-heading" className="font-semibold text-gray-800">Low Stock Alerts</h2>
        </header>
        {data.low_stock.length === 0 ? (
          <p className="p-5 text-gray-500 text-sm">All items are sufficiently stocked.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.low_stock.map((it, idx) => (
              <li key={idx} className="p-5 flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    <span aria-hidden="true">⚠ LOW STOCK — </span>{it.product_name}
                  </p>
                  {it.variant_name && <p className="text-sm text-gray-600">Variant: {it.variant_name}</p>}
                  <p className="text-sm text-gray-700 mt-1">
                    Current stock: <strong>{it.stock}</strong> · Safety stock: <strong>{it.safety_stock}</strong>
                  </p>
                </div>
                <Link
                  to="/inventory"
                  className="shrink-0 px-3 py-2 border border-brand-600 text-brand-700 rounded text-sm hover:bg-brand-50"
                >
                  View Inventory
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}