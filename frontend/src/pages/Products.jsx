
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Pencil, Trash2, Eye, Search, X,
  Package, Image as ImageIcon
} from 'lucide-react'
import { api } from '../api'
import Notification from '../components/Notification'
import { StockBadge } from '../components/StatusBadge'

const empty = {
  name: '', sku: '', description: '', price: '', stock: 0, safety_stock: 5,
  category_id: '', image_url: '', image_alt: '', status: 'Active',
  variants: [],
}

const fieldClass = 'w-full rounded-lg border border-[#DED8CD] bg-white px-3 py-2.5 text-sm text-[#292725] outline-none transition focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[#EAE2D5]'

const Field = ({ id, label, children, error }) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#4A4038]">
      {label}
    </label>
    {children}
    {error && (
      <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>
    )}
  </div>
)

export default function Products() {
  const [list, setList] = useState([])
  const [q, setQ] = useState('')
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)

  const accent = 'var(--app-accent, #a18b69)'

  const panelStyle = {
    backgroundColor: 'white',
    borderColor: `${accent}66`,
  }

  const accentButtonStyle = {
    backgroundColor: accent,
    color: 'white',
  }

  const load = () => api.products(q).then(setList).catch(() => {})

  useEffect(() => {
    load()
  }, [q])

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {})
  }, [])

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
      setNotice({
        type: 'success',
        message: editing ? 'Product updated.' : 'Product created.',
      })
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
    setForm(f => ({
      ...f,
      variants: (f.variants || []).filter((_, idx) => idx !== i),
    }))
  }

 
  return (
    <div className="space-y-6">
      {notice && (
        <Notification {...notice} onClose={() => setNotice(null)} />
      )}

      {/* Page Heading */}
      <section>
        <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: accent }}>
          Store Management
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#292725]">
          Products
        </h1>
        <p className="mt-1 text-sm text-[#8B7663]">
          Manage your product collection, prices, and available stock.
        </p>
      </section>

      {/* Search and Add */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex w-full items-center gap-3 rounded-lg border bg-white px-4 py-3 sm:max-w-sm"
          style={{ borderColor: `${accent}66` }}
        >
          <Search size={18} style={{ color: accent }} />
          <label htmlFor="search-products" className="sr-only">
            Search products
          </label>
          <input
            id="search-products"
            type="search"
            placeholder="Search by name or SKU..."
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

        <button
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition hover:opacity-85"
          style={accentButtonStyle}
        >
          <Plus size={17} />
          Add Product
        </button>
      </section>

      {/* Product Table */}
      <section className="overflow-hidden rounded-xl border shadow-sm" style={panelStyle}>
        <header
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: `${accent}66` }}
        >
          <div>
            <h2 className="font-semibold text-[#292725]">Product List</h2>
            <p className="mt-1 text-xs text-[#8B7663]">
              {list.length} product{list.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <Package size={21} style={{ color: accent }} />
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Product list</caption>
            <thead
              className="text-xs uppercase tracking-wider"
              style={{ backgroundColor: `${accent}18`, color: accent }}
            >
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Image</th>
                <th scope="col" className="px-5 py-3 font-medium">Product</th>
                <th scope="col" className="px-5 py-3 font-medium">SKU</th>
                <th scope="col" className="px-5 py-3 font-medium">Category</th>
                <th scope="col" className="px-5 py-3 font-medium">Price</th>
                <th scope="col" className="px-5 py-3 font-medium">Stock</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <Package size={30} className="mx-auto mb-3" style={{ color: accent }} />
                    <p className="font-medium text-[#4A4038]">No products found</p>
                    <p className="mt-1 text-xs text-[#A58F7B]">
                      Add a product or try another search.
                    </p>
                  </td>
                </tr>
              )}

              {list.map(p => (
                <tr
                  key={p.id}
                  className="border-t transition hover:bg-black/[0.02]"
                  style={{ borderColor: `${accent}30` }}
                >
                  <td className="px-5 py-4">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.image_alt || p.name}
                        className="h-12 w-12 rounded-lg border object-cover"
                        style={{ borderColor: `${accent}40` }}
                      />
                    ) : (
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${accent}20` }}
                      >
                        <ImageIcon size={20} style={{ color: accent }} />
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-4 font-medium text-[#292725]">{p.name}</td>
                  <td className="px-5 py-4 font-mono text-xs text-[#8B7663]">{p.sku}</td>
                  <td className="px-5 py-4 text-[#6F5C4B]">{p.category_name || '—'}</td>
                  <td className="px-5 py-4 font-medium text-[#292725]">
                    ₱{Number(p.price).toLocaleString()}
                  </td>

                  <td className="px-5 py-4">
                    <StockBadge stock={p.stock} safety={p.safety_stock} />
                    <span className="ml-2 text-xs text-[#8B7663]">({p.stock})</span>
                  </td>

                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      p.status === 'Active'
                        ? 'bg-[#EAEFE7] text-[#53664D]'
                        : p.status === 'Inactive'
                          ? 'bg-[#F0ECE7] text-[#8B7663]'
                          : 'bg-[#F5E9E3] text-[#9A604A]'
                    }`}>
                      {p.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/products/${p.id}`}
                        className="rounded-lg p-2 transition hover:bg-black/5"
                        style={{ color: accent }}
                        aria-label={`View details for ${p.name}`}
                      >
                        <Eye size={17} />
                      </Link>
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg p-2 transition hover:bg-black/5"
                        style={{ color: accent }}
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="rounded-lg p-2 text-[#9A604A] transition hover:bg-[#F5E9E3]"
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add / Edit Product Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-[#292725]/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-form-title"
        >
          <form
            onSubmit={save}
            noValidate
            className="my-8 w-full max-w-2xl space-y-5 rounded-2xl border bg-[#FDFCF9] p-5 shadow-2xl sm:p-7"
            style={{ borderColor: `${accent}66` }}
          >
            <div
              className="flex items-center justify-between border-b pb-4"
              style={{ borderColor: `${accent}66` }}
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em]" style={{ color: accent }}>
                  Product Management
                </p>
                <h2 id="product-form-title" className="mt-1 text-xl font-semibold text-[#292725]">
                  {editing ? 'Edit Product' : 'Add New Product'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 transition hover:bg-black/5"
                style={{ color: accent }}
                aria-label="Close product form"
              >
                <X size={20} />
              </button>
            </div>

            <Field id="p-name" label="Product Name *" error={errors.name}>
              <input id="p-name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className={fieldClass} required />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="p-sku" label="SKU *" error={errors.sku}>
                <input id="p-sku" value={form.sku}
                  onChange={e => setForm({ ...form, sku: e.target.value })}
                  className={fieldClass} required />
              </Field>

              <Field id="p-cat" label="Category">
                <select id="p-cat" value={form.category_id || ''}
                  onChange={e => setForm({ ...form, category_id: e.target.value || null })}
                  className={fieldClass}>
                  <option value="">— None —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>

            <Field id="p-desc" label="Description">
              <textarea id="p-desc" rows="3" value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className={fieldClass} />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field id="p-price" label="Price (₱) *" error={errors.price}>
                <input id="p-price" type="number" step="0.01" min="0.01"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  className={fieldClass} required />
              </Field>

              <Field id="p-stock" label="Stock *" error={errors.stock}>
                <input id="p-stock" type="number" min="0" value={form.stock}
                  onChange={e => setForm({ ...form, stock: e.target.value })}
                  className={fieldClass} required />
              </Field>

              <Field id="p-safety" label="Safety Stock *" error={errors.safety_stock}>
                <input id="p-safety" type="number" min="0" value={form.safety_stock}
                  onChange={e => setForm({ ...form, safety_stock: e.target.value })}
                  className={fieldClass} required />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="p-img" label="Image URL">
                <input id="p-img" type="url" value={form.image_url || ''}
                  onChange={e => setForm({ ...form, image_url: e.target.value })}
                  className={fieldClass} placeholder="https://..." />
              </Field>

              <Field id="p-alt" label="Image Alt Text">
                <input id="p-alt" value={form.image_alt || ''}
                  onChange={e => setForm({ ...form, image_alt: e.target.value })}
                  className={fieldClass} placeholder="Describe the product image" />
              </Field>
            </div>

            <Field id="p-status" label="Status">
              <select id="p-status" value={form.status || 'Active'}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className={fieldClass}>
                <option>Active</option>
                <option>Inactive</option>
                <option>Out of Stock</option>
              </select>
            </Field>

            {/* Variants */}
            {!editing && (
              <section aria-labelledby="variants-heading" className="space-y-4 border-t pt-5"
                style={{ borderColor: `${accent}66` }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 id="variants-heading" className="font-semibold text-[#292725]">
                      Product Variants
                    </h3>
                    <p className="mt-1 text-xs text-[#8B7663]">
                      Add sizes, colors, shades, or scents if needed.
                    </p>
                  </div>
                  <button type="button" onClick={addVariant}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition hover:opacity-75"
                    style={{ borderColor: accent, color: accent }}>
                    <Plus size={14} /> Add Variant
                  </button>
                </div>

                {(form.variants || []).length === 0 && (
                  <p className="rounded-lg p-4 text-xs"
                    style={{ backgroundColor: `${accent}15`, color: accent }}>
                    No variants added.
                  </p>
                )}

                <ul className="space-y-4">
                  {(form.variants || []).map((v, i) => (
                    <li key={i}
                      className="grid grid-cols-1 gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2"
                      style={{ borderColor: `${accent}50` }}>
                      <div className="flex items-center justify-between sm:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>
                          Variant #{i + 1}
                        </span>
                        <button type="button" onClick={() => removeVariant(i)}
                          className="text-xs font-medium text-[#9A604A] hover:underline"
                          aria-label={`Remove variant ${i + 1}`}>
                          Remove
                        </button>
                      </div>

                      {[
                        ['variant_name', 'Variant Name', 'e.g. White / Size 8'],
                        ['sku', 'SKU', 'Variant SKU'],
                        ['stock', 'Stock', '0'],
                        ['price', 'Price (₱)', 'Product price if blank'],
                        ['size', 'Size', 'e.g. Small'],
                        ['color', 'Color', 'e.g. Beige'],
                        ['shade', 'Shade', 'e.g. Nude'],
                        ['scent', 'Scent', 'e.g. Vanilla'],
                      ].map(([key, label, placeholder]) => (
                        <div key={key}>
                          <label htmlFor={`v-${key}-${i}`}
                            className="mb-1 block text-xs font-medium text-[#6F5C4B]">
                            {label}
                          </label>
                          <input
                            id={`v-${key}-${i}`}
                            type={key === 'stock' || key === 'price' ? 'number' : 'text'}
                            min={key === 'stock' || key === 'price' ? '0' : undefined}
                            step={key === 'price' ? '0.01' : undefined}
                            value={v[key]}
                            onChange={e => updateVariant(i, key, e.target.value)}
                            className={fieldClass}
                            placeholder={placeholder}
                          />
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="flex justify-end gap-3 border-t pt-5"
              style={{ borderColor: `${accent}66` }}>
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-lg border px-5 py-2.5 text-sm transition hover:opacity-70"
                style={{ borderColor: `${accent}66`, color: accent }}>
                Cancel
              </button>
              <button type="submit"
                className="rounded-lg px-5 py-2.5 text-sm font-medium transition hover:opacity-85"
                style={accentButtonStyle}>
                {editing ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
