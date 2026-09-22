import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, Search, X } from 'lucide-react'
import { api } from '../api'
import Notification from '../components/Notification'
import { StockBadge } from '../components/StatusBadge'

const empty = {
  name: '', sku: '', description: '', price: '', stock: 0, safety_stock: 5,
  category_id: '', image_url: '', image_alt: '', status: 'Active',
  variants: [],
}

export default function Products() {
  const [list, setList] = useState([])
  const [q, setQ] = useState('')
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)

  const load = () => api.products(q).then(setList).catch(() => {})
  useEffect(() => { load() }, [q])
  useEffect(() => { api.categories().then(setCategories).catch(() => {}) }, [])

  const openNew = () => {
    setForm(empty)
    setEditing(null)
    setErrors({})
    setShowForm(true)
  }

  const openEdit = (p) => {
    setForm({
      name: p.name || '',
      sku: p.sku || '',
      description: p.description || '',
      price: p.price ?? '',
      stock: p.stock ?? 0,
      safety_stock: p.safety_stock ?? 5,
      category_id: p.category_id || '',
      image_url: p.image_url || '',
      image_alt: p.image_alt || '',
      status: p.status || 'Active',
      variants: [],
    })
    setEditing(p.id)
    setErrors({})
    setShowForm(true)
  }

  const save = async (e) => {
    e.preventDefault()
    setErrors({})
    try {
      if (editing) await api.updateProduct(editing, form)
      else await api.createProduct(form)
      setShowForm(false)
      setNotice({ type: 'success', message: editing ? 'Product updated.' : 'Product created.' })
      load()
    } catch (err) {
      if (err.data?.errors) setErrors(err.data.errors)
      else setNotice({ type: 'error', message: err.message })
    }
  }

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    try {
      await api.deleteProduct(p.id)
      setNotice({ type: 'success', message: 'Product deleted.' })
      load()
    } catch (err) {
      setNotice({ type: 'error', message: err.message })
    }
  }

  // ---- Variants (only when creating a new product) ----
  const addVariant = () => {
    setForm(f => ({
      ...f,
      variants: [...(f.variants || []), {
        variant_name: '', sku: '', price: '', stock: 0,
        size: '', color: '', shade: '', scent: '',
      }],
    }))
  }
  const updateVariant = (i, key, value) => {
    setForm(f => {
      const variants = [...(f.variants || [])]
      variants[i] = { ...variants[i], [key]: value }
      return { ...f, variants }
    })
  }
  const removeVariant = (i) => {
    setForm(f => ({ ...f, variants: (f.variants || []).filter((_, idx) => idx !== i) }))
  }

  const inputClass = (field) =>
    `w-full border rounded px-3 py-2 ${errors[field] ? 'border-red-500' : 'border-gray-300'}`

  const Field = ({ id, label, children, error }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p role="alert" className="text-xs text-red-700 mt-1">{error}</p>}
    </div>
  )

  return (
    <div className="space-y-4">
      {notice && <Notification {...notice} onClose={() => setNotice(null)} />}

      <header className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-3 py-2 w-full sm:w-80">
          <Search size={16} className="text-gray-400" aria-hidden="true" />
          <label htmlFor="search-products" className="sr-only">Search products</label>
          <input
            id="search-products"
            type="search"
            placeholder="Search by name or SKU"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="w-full outline-none text-sm"
          />
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded font-medium"
        >
          <Plus size={16} aria-hidden="true" /> Add Product
        </button>
      </header>

      <div className="bg-white rounded shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Product list</caption>
          <thead className="bg-gray-50 text-left text-gray-600 uppercase text-xs">
            <tr>
              <th scope="col" className="px-4 py-2">Image</th>
              <th scope="col" className="px-4 py-2">Name</th>
              <th scope="col" className="px-4 py-2">SKU</th>
              <th scope="col" className="px-4 py-2">Category</th>
              <th scope="col" className="px-4 py-2">Price</th>
              <th scope="col" className="px-4 py-2">Stock</th>
              <th scope="col" className="px-4 py-2">Status</th>
              <th scope="col" className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
            {list.map(p => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.image_alt || p.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gray-100" aria-hidden="true" />
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3">{p.category_name || '—'}</td>
                <td className="px-4 py-3">₱{Number(p.price).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <StockBadge stock={p.stock} safety={p.safety_stock} />
                  <span className="ml-2 text-xs text-gray-600">({p.stock})</span>
                </td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3 text-right space-x-1">
                  <Link
                    to={`/products/${p.id}`}
                    className="inline-block p-1 text-gray-600 hover:text-brand-700"
                    aria-label={`View details for ${p.name}`}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </Link>
                  <button
                    onClick={() => openEdit(p)}
                    className="inline-block p-1 text-gray-600 hover:text-brand-700"
                    aria-label={`Edit ${p.name}`}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => remove(p)}
                    className="inline-block p-1 text-gray-600 hover:text-red-700"
                    aria-label={`Delete ${p.name}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-start justify-center overflow-y-auto p-4 z-40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-form-title"
        >
          <form
            onSubmit={save}
            noValidate
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-4 my-8"
          >
            <div className="flex items-center justify-between">
              <h2 id="product-form-title" className="text-lg font-bold text-gray-800">
                {editing ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1 text-gray-500 hover:text-gray-800"
                aria-label="Close product form"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <Field id="p-name" label="Product Name *" error={errors.name}>
              <input
                id="p-name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className={inputClass('name')}
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field id="p-sku" label="SKU *" error={errors.sku}>
                <input
                  id="p-sku"
                  value={form.sku}
                  onChange={e => setForm({ ...form, sku: e.target.value })}
                  className={inputClass('sku')}
                  required
                />
              </Field>
              <Field id="p-cat" label="Category">
                <select
                  id="p-cat"
                  value={form.category_id || ''}
                  onChange={e => setForm({ ...form, category_id: e.target.value || null })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">— None —</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field id="p-desc" label="Description">
              <textarea
                id="p-desc"
                rows="2"
                value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field id="p-price" label="Price (₱) *" error={errors.price}>
                <input
                  id="p-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  className={inputClass('price')}
                  required
                />
              </Field>
              <Field id="p-stock" label="Stock *" error={errors.stock}>
                <input
                  id="p-stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={e => setForm({ ...form, stock: e.target.value })}
                  className={inputClass('stock')}
                  required
                />
              </Field>
              <Field id="p-safety" label="Safety Stock *" error={errors.safety_stock}>
                <input
                  id="p-safety"
                  type="number"
                  min="0"
                  value={form.safety_stock}
                  onChange={e => setForm({ ...form, safety_stock: e.target.value })}
                  className={inputClass('safety_stock')}
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field id="p-img" label="Image URL">
                <input
                  id="p-img"
                  type="url"
                  value={form.image_url || ''}
                  onChange={e => setForm({ ...form, image_url: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="https://…"
                />
              </Field>
              <Field id="p-alt" label="Image Alt Text (required for accessibility)">
                <input
                  id="p-alt"
                  value={form.image_alt || ''}
                  onChange={e => setForm({ ...form, image_alt: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g. White classic athletic sneaker"
                />
              </Field>
            </div>

            <Field id="p-status" label="Status">
              <select
                id="p-status"
                value={form.status || 'Active'}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>Out of Stock</option>
              </select>
            </Field>

            {/* Variants — only for new products (edit via Product Details) */}
            {!editing && (
              <section aria-labelledby="variants-heading" className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 id="variants-heading" className="font-semibold text-gray-800">
                    Product Variants
                  </h3>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
                  >
                    <Plus size={14} aria-hidden="true" /> Add Variant
                  </button>
                </div>

                {(form.variants || []).length === 0 && (
                  <p className="text-xs text-gray-500">
                    No variants yet. Add one if this product has sizes, colors, shades, or scents.
                  </p>
                )}

                <ul className="space-y-3">
                  {(form.variants || []).map((v, i) => (
                    <li key={i} className="border border-gray-200 rounded p-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-3 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                          Variant #{i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          className="text-red-600 hover:underline text-xs"
                          aria-label={`Remove variant ${i + 1}`}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor={`v-name-${i}`} className="block text-xs text-gray-600 mb-1">
                          Variant Name *
                        </label>
                        <input
                          id={`v-name-${i}`}
                          value={v.variant_name}
                          onChange={e => updateVariant(i, 'variant_name', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          placeholder="e.g. White / Size 8"
                        />
                      </div>
                      <div>
                        <label htmlFor={`v-sku-${i}`} className="block text-xs text-gray-600 mb-1">
                          SKU *
                        </label>
                        <input
                          id={`v-sku-${i}`}
                          value={v.sku}
                          onChange={e => updateVariant(i, 'sku', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          placeholder="SNK-001-WHT-8"
                        />
                      </div>
                      <div>
                        <label htmlFor={`v-stock-${i}`} className="block text-xs text-gray-600 mb-1">
                          Stock
                        </label>
                        <input
                          id={`v-stock-${i}`}
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={e => updateVariant(i, 'stock', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor={`v-price-${i}`} className="block text-xs text-gray-600 mb-1">
                          Price (₱)
                        </label>
                        <input
                          id={`v-price-${i}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={v.price}
                          onChange={e => updateVariant(i, 'price', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          placeholder="Defaults to product price"
                        />
                      </div>
                      <div>
                        <label htmlFor={`v-size-${i}`} className="block text-xs text-gray-600 mb-1">
                          Size
                        </label>
                        <input
                          id={`v-size-${i}`}
                          value={v.size}
                          onChange={e => updateVariant(i, 'size', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor={`v-color-${i}`} className="block text-xs text-gray-600 mb-1">
                          Color
                        </label>
                        <input
                          id={`v-color-${i}`}
                          value={v.color}
                          onChange={e => updateVariant(i, 'color', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor={`v-shade-${i}`} className="block text-xs text-gray-600 mb-1">
                          Shade
                        </label>
                        <input
                          id={`v-shade-${i}`}
                          value={v.shade}
                          onChange={e => updateVariant(i, 'shade', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor={`v-scent-${i}`} className="block text-xs text-gray-600 mb-1">
                          Scent
                        </label>
                        <input
                          id={`v-scent-${i}`}
                          value={v.scent}
                          onChange={e => updateVariant(i, 'scent', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded font-medium"
              >
                {editing ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}