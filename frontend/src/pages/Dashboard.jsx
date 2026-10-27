
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  ShoppingCart,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import { api } from '../api'
import { OrderStatusBadge } from '../components/StatusBadge'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const accent = 'var(--app-accent, #a18b69)'

  useEffect(() => {
    api.dashboard().then(setData).catch(e => setError(e.message))
  }, [])

  if (error) {
    return (
      <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </p>
    )
  }

  if (!data) {
    return <p className="text-sm" style={{ color: accent }}>Loading dashboard...</p>
  }

  const stats = [
    {
      label: 'Total Products',
      value: data.total_products,
      description: 'Products in your store',
      icon: Package,
    },
    {
      label: 'Total Orders',
      value: data.total_orders,
      description: 'Orders received',
      icon: ShoppingCart,
    },
    {
      label: 'Pending Orders',
      value: data.pending_orders,
      description: 'Orders waiting for action',
      icon: Clock,
    },
    {
      label: 'Low Stock',
      value: data.low_stock_count,
      description: 'Items needing attention',
      icon: AlertTriangle,
    },
  ]

  const panelStyle = {
    backgroundColor: 'white',
    borderColor: `${accent}66`,
  }

  const linkStyle = {
    color: accent,
  }

  return (
    <div className="space-y-8">

      {/* Dashboard Heading */}
      <section>
        <p className="text-xs font-medium uppercase tracking-[0.2em]" style={linkStyle}>
          Overview
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-wide text-[#292725]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#8B7663]">
          Welcome to your Athaliah Collections store management system.
        </p>
      </section>

      {/* Statistics */}
      <section aria-label="Dashboard statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, description, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border p-5 shadow-sm transition-colors"
              style={panelStyle}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#8B7663]">{label}</p>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: `${accent}20`, color: accent }}
                >
                  <Icon size={20} />
                </div>
              </div>
              <p className="mt-4 text-3xl font-semibold text-[#292725]">
                {value}
              </p>
              <p className="mt-1 text-xs" style={linkStyle}>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Orders */}
      <section
        aria-labelledby="recent-orders-heading"
        className="overflow-hidden rounded-xl border shadow-sm"
        style={panelStyle}
      >
        <header
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: `${accent}66` }}
        >
          <div>
            <h2 id="recent-orders-heading" className="font-semibold text-[#292725]">
              Recent Orders
            </h2>
            <p className="mt-1 text-xs text-[#8B7663]">
              Latest customer transactions
            </p>
          </div>
          <Link
            to="/orders"
            className="flex items-center gap-2 text-xs font-medium hover:opacity-70"
            style={linkStyle}
          >
            View All <ArrowRight size={15} />
          </Link>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Recent orders table</caption>
            <thead
              className="text-xs uppercase tracking-wider"
              style={{ backgroundColor: `${accent}18`, color: accent }}
            >
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Order #</th>
                <th scope="col" className="px-5 py-3 font-medium">Customer</th>
                <th scope="col" className="px-5 py-3 font-medium">Total</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_orders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-5 py-8 text-center text-sm text-[#A58F7B]">
                    No orders available yet.
                  </td>
                </tr>
              ) : (
                data.recent_orders.map(o => (
                  <tr
                    key={o.id}
                    className="border-t hover:bg-black/[0.02]"
                    style={{ borderColor: `${accent}30` }}
                  >
                    <td className="px-5 py-4">
                      <Link
                        to={`/orders/${o.id}`}
                        className="font-medium hover:underline"
                        style={linkStyle}
                      >
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-[#4A4038]">{o.customer}</td>
                    <td className="px-5 py-4 font-medium text-[#292725]">
                      ₱{Number(o.total).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <OrderStatusBadge status={o.order_status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Low Stock Alerts */}
      <section
        aria-labelledby="low-stock-heading"
        className="overflow-hidden rounded-xl border shadow-sm"
        style={panelStyle}
      >
        <header
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: `${accent}66` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="rounded-lg p-2"
              style={{ backgroundColor: `${accent}20`, color: accent }}
            >
              <AlertTriangle size={19} />
            </div>
            <div>
              <h2 id="low-stock-heading" className="font-semibold text-[#292725]">
                Low Stock Alerts
              </h2>
              <p className="mt-1 text-xs text-[#8B7663]">
                Products that need restocking
              </p>
            </div>
          </div>
          <Link
            to="/inventory"
            className="flex items-center gap-2 text-xs font-medium hover:opacity-70"
            style={linkStyle}
          >
            Inventory <ArrowRight size={15} />
          </Link>
        </header>

        {data.low_stock.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <TrendingUp size={25} className="mx-auto mb-2" style={linkStyle} />
            <p className="text-sm font-medium text-[#4A4038]">
              All items are sufficiently stocked.
            </p>
            <p className="mt-1 text-xs text-[#A58F7B]">
              No products currently need restocking.
            </p>
          </div>
        ) : (
          <ul>
            {data.low_stock.map((it, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between gap-4 border-t px-5 py-4"
                style={{ borderColor: `${accent}30` }}
              >
                <div className="min-w-0">
                  <p className="font-medium text-[#292725]">
                    {it.product_name}
                  </p>
                  {it.variant_name && (
                    <p className="mt-1 text-xs text-[#8B7663]">
                      Variant: {it.variant_name}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-[#6F5C4B]">
                    Current stock: <strong>{it.stock}</strong>
                    {' · '}
                    Safety stock: <strong>{it.safety_stock}</strong>
                  </p>
                </div>

                <Link
                  to="/inventory"
                  className="shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition hover:opacity-70"
                  style={{
                    borderColor: accent,
                    color: accent,
                    backgroundColor: `${accent}10`,
                  }}
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
