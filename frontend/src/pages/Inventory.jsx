import { useEffect, useState } from 'react'
import { Boxes, Search, Save } from 'lucide-react'
import { api } from '../api'
import Notification from '../components/Notification'
import { StockBadge } from '../components/StatusBadge'

export default function Inventory() {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null) // { id, kind, value }
  const [notice, setNotice] = useState(null)

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

  const startEdit = (it) => setEditing({ id: it.id, kind: it.kind, value: it.current_stock })
  const cancelEdit = () => setEditing(null)

  const saveEdit = async () => {
    if (!editing) return
    const n = Number(editing.value)
    if (!Number.isInteger(n) || n < 0) {
      setNotice({ type: 'error', message: 'Stock must be a non-negative whole number.' })
      return
    }
    try {
      await api.updateInventory(editing.id, { stock: n, kind: editing.kind })
      setNotice({ type: 'success', message: 'Stock updated.' })
      setEditing(null)
      load()
    } catch (err) {
      setNotice({ type: 'error', message: err.message })
    }
  }

  return (
    <div className="space-y-4">
      {notice && <Notification {...notice} onClose={() => setNotice(null)} />}

      <header className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Boxes size={20} className="text-brand-600" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-gray-800">Inventory</h1>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-3 py-2 w-full sm:w-64">
            <Search size={16} className="text-gray-400" aria-hidden="true" />
            <label htmlFor="search-inventory" className="sr-only">Search inventory</label>
            <input
              id="search-inventory"
              type="search"
              placeholder="Search product, SKU, variant"
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="inv-filter" className="sr-only">Filter inventory by status</label>
            <select
              id="inv-filter"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
            >
              <option value="all">All statuses</option>
              <option value="in">✓ In Stock</option>
              <option value="low">⚠ Low Stock</option>
              <option value="out">✕ Out of Stock</option>
            </select>
          </div>
        </div>
      </header>

      <div className="bg-white rounded shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Inventory list with stock levels and status</caption>
          <thead className="bg-gray-50 text-left text-gray-600 uppercase text-xs">
            <tr>
              <th scope="col" className="px-4 py-2">Product</th>
              <th scope="col" className="px-4 py-2">SKU</th>
              <th scope="col" className="px-4 py-2">Variant</th>
              <th scope="col" className="px-4 py-2">Current Stock</th>
              <th scope="col" className="px-4 py-2">Safety Stock</th>
              <th scope="col" className="px-4 py-2">Status</th>
              <th scope="col" className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No inventory records match your filters.
                </td>
              </tr>
            )}
            {filtered.map(it => {
              const isEditing = editing && editing.id === it.id && editing.kind === it.kind
              return (
                <tr key={`${it.kind}-${it.id}`} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{it.product}</td>
                  <td className="px-4 py-3 font-mono text-xs">{it.sku}</td>
                  <td className="px-4 py-3">{it.variant || <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={editing.value}
                        onChange={e => setEditing({ ...editing, value: e.target.value })}
                        className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                        aria-label={`New stock for ${it.product} ${it.variant || ''}`}
                      />
                    ) : (
                      it.current_stock
                    )}
                  </td>
                  <td className="px-4 py-3">{it.safety_stock}</td>
                  <td className="px-4 py-3">
                    <StockBadge stock={it.current_stock} safety={it.safety_stock} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <div className="inline-flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-brand-600 text-white rounded text-xs hover:bg-brand-700"
                        >
                          <Save size={12} aria-hidden="true" /> Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(it)}
                        className="px-2 py-1 border border-brand-600 text-brand-700 rounded text-xs hover:bg-brand-50"
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

      <p className="text-xs text-gray-500">
        Status rules — ✕ OUT OF STOCK when stock is 0 · ⚠ LOW STOCK when stock ≤ safety stock · ✓ IN STOCK otherwise.
      </p>
    </div>
  )
}