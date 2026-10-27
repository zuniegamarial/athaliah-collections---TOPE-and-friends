
import { useEffect, useState } from 'react'
import {
  Boxes, Search, Save, X, Package,
  AlertTriangle, CheckCircle2, Ban
} from 'lucide-react'
import { api } from '../api'
import Notification from '../components/Notification'
import { StockBadge } from '../components/StatusBadge'

export default function Inventory() {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [notice, setNotice] = useState(null)

  const accent = 'var(--app-accent, #a18b69)'

  const panelStyle = {
    backgroundColor: 'white',
    borderColor: `${accent}66`,
  }

  const load = () => api.inventory().then(setItems).catch(() => {})
  useEffect(() => { load() }, [])

  const filtered = items.filter(it => {
    const matchesQ =
      !q ||
      it.product.toLowerCase().includes(q.toLowerCase()) ||
      (it.sku || '').toLowerCase().includes(q.toLowerCase()) ||
      (it.variant || '').toLowerCase().includes(q.toLowerCase())

    const matchesFilter =
      filter === 'all' ||
      (filter === 'low' && it.status === 'LOW STOCK') ||
      (filter === 'out' && it.status === 'OUT OF STOCK') ||
      (filter === 'in' && it.status === 'IN STOCK')

    return matchesQ && matchesFilter
  })

  const startEdit = (it) => {
    setEditing({ id: it.id, kind: it.kind, value: it.current_stock })
  }

  const cancelEdit = () => setEditing(null)

  const saveEdit = async () => {
    if (!editing) return

    const n = Number(editing.value)

    if (!Number.isInteger(n) || n < 0) {
      setNotice({
        type: 'error',
        message: 'Stock must be a non-negative whole number.',
      })
      return
    }

    try {
      await api.updateInventory(editing.id, {
        stock: n,
        kind: editing.kind,
      })

      setNotice({ type: 'success', message: 'Stock updated successfully.' })
      setEditing(null)
      load()
    } catch (err) {
      setNotice({ type: 'error', message: err.message })
    }
  }

  const totalItems = items.length
  const inStock = items.filter(it => it.status === 'IN STOCK').length
  const lowStock = items.filter(it => it.status === 'LOW STOCK').length
  const outOfStock = items.filter(it => it.status === 'OUT OF STOCK').length

  const stats = [
    { label: 'Total Items', value: totalItems, description: 'Inventory records', icon: Boxes },
    { label: 'In Stock', value: inStock, description: 'Items with sufficient stock', icon: CheckCircle2 },
    { label: 'Low Stock', value: lowStock, description: 'Items needing attention', icon: AlertTriangle },
    { label: 'Out of Stock', value: outOfStock, description: 'Items with zero stock', icon: Ban },
  ]

  return (
    <div className="space-y-6">
      {notice && (
        <Notification {...notice} onClose={() => setNotice(null)} />
      )}

      {/* Heading */}
      <section>
        <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: accent }}>
          Store Management
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#292725]">
          Inventory
        </h1>
        <p className="mt-1 text-sm text-[#8B7663]">
          Monitor product quantities and manage your stock levels.
        </p>
      </section>

      {/* Inventory Summary */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, description, icon: Icon }) => (
          <div key={label} className="rounded-xl border p-5 shadow-sm" style={panelStyle}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#8B7663]">{label}</p>
              <div
                className="rounded-lg p-3"
                style={{ backgroundColor: `${accent}20`, color: accent }}
              >
                <Icon size={20} />
              </div>
            </div>
            <p className="mt-4 text-3xl font-semibold text-[#292725]">{value}</p>
            <p className="mt-1 text-xs" style={{ color: accent }}>{description}</p>
          </div>
        ))}
      </section>

      {/* Search and Filter */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex w-full items-center gap-3 rounded-lg border bg-white px-4 py-3 sm:max-w-sm"
          style={{ borderColor: `${accent}66` }}
        >
          <Search size={18} style={{ color: accent }} />
          <label htmlFor="search-inventory" className="sr-only">
            Search inventory
          </label>
          <input
            id="search-inventory"
            type="search"
            placeholder="Search product, SKU, variant..."
            value={q}
            onChange={e => setQ(e.target.value)}
            className="w-full bg-transparent text-sm text-[#292725] outline-none placeholder:text-[#B6AA9B]"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Clear search">
              <X size={16} style={{ color: accent }} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="inv-filter" className="text-xs font-medium" style={{ color: accent }}>
            Filter:
          </label>
          <select
            id="inv-filter"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="rounded-lg border bg-white px-3 py-3 text-sm text-[#4A4038] outline-none"
            style={{ borderColor: `${accent}66` }}
          >
            <option value="all">All statuses</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </section>

      {/* Inventory Table */}
      <section className="overflow-hidden rounded-xl border shadow-sm" style={panelStyle}>
        <header
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: `${accent}66` }}
        >
          <div>
            <h2 className="font-semibold text-[#292725]">Inventory Records</h2>
            <p className="mt-1 text-xs text-[#8B7663]">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''} displayed
            </p>
          </div>
          <Package size={21} style={{ color: accent }} />
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Inventory list with stock levels and status
            </caption>
            <thead
              className="text-xs uppercase tracking-wider"
              style={{ backgroundColor: `${accent}18`, color: accent }}
            >
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Product</th>
                <th scope="col" className="px-5 py-3 font-medium">SKU</th>
                <th scope="col" className="px-5 py-3 font-medium">Variant</th>
                <th scope="col" className="px-5 py-3 font-medium">Current Stock</th>
                <th scope="col" className="px-5 py-3 font-medium">Safety Stock</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Boxes size={30} className="mx-auto mb-3" style={{ color: accent }} />
                    <p className="font-medium text-[#4A4038]">
                      No inventory records found
                    </p>
                    <p className="mt-1 text-xs text-[#A58F7B]">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              )}

              {filtered.map(it => {
                const isEditing =
                  editing &&
                  editing.id === it.id &&
                  editing.kind === it.kind

                return (
                  <tr
                    key={`${it.kind}-${it.id}`}
                    className="border-t transition hover:bg-black/[0.02]"
                    style={{ borderColor: `${accent}30` }}
                  >
                    <td className="px-5 py-4 font-medium text-[#292725]">
                      {it.product}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-[#8B7663]">
                      {it.sku}
                    </td>

                    <td className="px-5 py-4 text-[#6F5C4B]">
                      {it.variant || '—'}
                    </td>

                    <td className="px-5 py-4">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editing.value}
                          onChange={e =>
                            setEditing({ ...editing, value: e.target.value })
                          }
                          className="w-24 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                          style={{ borderColor: accent }}
                          aria-label={`New stock for ${it.product} ${it.variant || ''}`}
                        />
                      ) : (
                        <span className="font-semibold text-[#292725]">
                          {it.current_stock}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-[#6F5C4B]">
                      {it.safety_stock}
                    </td>

                    <td className="px-5 py-4">
                      <StockBadge
                        stock={it.current_stock}
                        safety={it.safety_stock}
                      />
                    </td>

                    <td className="px-5 py-4 text-right">
                      {isEditing ? (
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-white transition hover:opacity-85"
                            style={{ backgroundColor: accent }}
                          >
                            <Save size={13} /> Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-lg border px-3 py-2 text-xs transition hover:opacity-70"
                            style={{ borderColor: accent, color: accent }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEdit(it)}
                          className="rounded-lg border px-3 py-2 text-xs font-medium transition hover:opacity-70"
                          style={{
                            borderColor: accent,
                            color: accent,
                            backgroundColor: `${accent}10`,
                          }}
                          aria-label={`Update stock for ${it.product} ${it.variant || ''}`}
                        >
                          Update Stock
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs leading-relaxed text-[#8B7663]">
        <strong>Stock status rules:</strong> Out of Stock = 0 items ·
        Low Stock = stock is less than or equal to safety stock ·
        In Stock = stock is above safety stock.
      </p>
    </div>
  )
}
