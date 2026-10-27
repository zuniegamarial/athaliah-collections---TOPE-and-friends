
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Trash2,
  Package,
  Image as ImageIcon,
  Tag,
  Boxes,
  AlertTriangle,
} from 'lucide-react'
import { api } from '../api'
import Notification from '../components/Notification'
import { StockBadge } from '../components/StatusBadge'

export default function ProductDetails() {
  const { id } = useParams()
  const nav = useNavigate()
  const [product, setProduct] = useState(null)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)

  const accent = 'var(--app-accent, #a18b69)'
  const accentTint = 'color-mix(in srgb, var(--app-accent, #a18b69) 12%, transparent)'
  const accentBorder = 'color-mix(in srgb, var(--app-accent, #a18b69) 40%, white)'

  const load = () =>
    api.product(id)
      .then(setProduct)
      .catch(() => setNotice({ type: 'error', message: 'Product not found.' }))

  useEffect(() => {
    load()
  }, [id])

  if (!product) {
    return (
      <div
        className="rounded border bg-white p-8 text-center text-sm"
        style={{ borderColor: accentBorder, color: accent }}
      >
        Loading product...
      </div>
    )
  }

  const save = async (e) => {
    e.preventDefault()
    setErrors({})

    try {
      await api.updateProduct(id, product)
      setNotice({ type: 'success', message: 'Product updated.' })
      load()
    } catch (err) {
      if (err.data?.errors) setErrors(err.data.errors)
      else setNotice({ type: 'error', message: err.message })
    }
  }

  const removeProduct = async () => {
    if (!window.confirm('Delete this product permanently?')) return

    try {
      await api.deleteProduct(id)
      nav('/products')
    } catch (err) {
      setNotice({ type: 'error', message: err.message })
    }
  }

  const update = (key, value) =>
    setProduct(p => ({ ...p, [key]: value }))

  const inputClass = (field) =>
    `w-full rounded border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 ${
      errors[field] ? 'border-red-500' : ''
    }`

  const inputStyle = (field) => ({
    borderColor: errors[field] ? undefined : accentBorder,
    '--tw-ring-color': accent,
  })

  return (
    <div className="space-y-6 text-[#292725]">

      {notice && (
        <Notification {...notice} onClose={() => setNotice(null)} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70"
          style={{ color: accent }}
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>

        <button
          onClick={removeProduct}
          className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm font-medium transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          style={{ borderColor: accentBorder, color: accent }}
        >
          <Trash2 size={16} />
          Delete Product
        </button>
      </div>

      <header
        className="rounded border bg-white p-5"
        style={{ borderColor: accentBorder }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p
              className="text-xs font-medium tracking-[0.18em]"
              style={{ color: accent }}
            >
              PRODUCT INFORMATION
            </p>
            <h1 className="mt-2 text-2xl font-semibold">
              {product.name}
            </h1>
            <p className="mt-1 font-mono text-sm" style={{ color: accent }}>
              {product.sku}
            </p>
          </div>

          <div className="rounded p-3" style={{ backgroundColor: accentTint }}>
            <Package size={25} style={{ color: accent }} />
          </div>
        </div>
      </header>

      <form
        onSubmit={save}
        noValidate
        className="space-y-5 rounded border bg-white p-5"
        style={{ borderColor: accentBorder }}
      >
        <div
          className="flex items-center gap-2 border-b pb-4"
          style={{ borderColor: accentBorder }}
        >
          <Tag size={19} style={{ color: accent }} />
          <h2 className="font-semibold">Edit Product Details</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          <div className="lg:col-span-1">
            <h3 className="mb-3 text-sm font-medium">Product Image</h3>

            <div
              className="flex min-h-64 items-center justify-center overflow-hidden rounded border"
              style={{ borderColor: accentBorder, backgroundColor: accentTint }}
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.image_alt || product.name}
                  className="max-h-80 w-full object-contain"
                />
              ) : (
                <div className="text-center" style={{ color: accent }}>
                  <ImageIcon size={35} className="mx-auto mb-2" />
                  <p className="text-sm">No product image</p>
                </div>
              )}
            </div>

            <p className="mt-2 break-words text-xs" style={{ color: accent }}>
              Alt text: {product.image_alt || product.name}
            </p>
          </div>

          <div className="space-y-4 lg:col-span-2">

            <div>
              <label htmlFor="pd-name" className="mb-1 block text-sm font-medium">
                Product Name *
              </label>
              <input
                id="pd-name"
                value={product.name}
                onChange={e => update('name', e.target.value)}
                className={inputClass('name')}
                style={inputStyle('name')}
                required
              />
              {errors.name && (
                <p role="alert" className="mt-1 text-xs text-red-700">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="pd-sku" className="mb-1 block text-sm font-medium">
                  SKU *
                </label>
                <input
                  id="pd-sku"
                  value={product.sku}
                  onChange={e => update('sku', e.target.value)}
                  className={inputClass('sku')}
                  style={inputStyle('sku')}
                  required
                />
                {errors.sku && (
                  <p role="alert" className="mt-1 text-xs text-red-700">
                    {errors.sku}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="pd-status" className="mb-1 block text-sm font-medium">
                  Product Status
                </label>
                <select
                  id="pd-status"
                  value={product.status}
                  onChange={e => update('status', e.target.value)}
                  className={inputClass('status')}
                  style={inputStyle('status')}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Out of Stock</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="pd-desc" className="mb-1 block text-sm font-medium">
                Description
              </label>
              <textarea
                id="pd-desc"
                rows={3}
                value={product.description || ''}
                onChange={e => update('description', e.target.value)}
                className={inputClass('description')}
                style={inputStyle('description')}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="pd-price" className="mb-1 block text-sm font-medium">
                  Price (₱) *
                </label>
                <input
                  id="pd-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={product.price}
                  onChange={e => update('price', e.target.value)}
                  className={inputClass('price')}
                  style={inputStyle('price')}
                  required
                />
                {errors.price && (
                  <p role="alert" className="mt-1 text-xs text-red-700">
                    {errors.price}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="pd-stock" className="mb-1 block text-sm font-medium">
                  Stock *
                </label>
                <input
                  id="pd-stock"
                  type="number"
                  min="0"
                  value={product.stock}
                  onChange={e => update('stock', e.target.value)}
                  className={inputClass('stock')}
                  style={inputStyle('stock')}
                  required
                />
                {errors.stock && (
                  <p role="alert" className="mt-1 text-xs text-red-700">
                    {errors.stock}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="pd-safety" className="mb-1 block text-sm font-medium">
                  Safety Stock *
                </label>
                <input
                  id="pd-safety"
                  type="number"
                  min="0"
                  value={product.safety_stock}
                  onChange={e => update('safety_stock', e.target.value)}
                  className={inputClass('safety_stock')}
                  style={inputStyle('safety_stock')}
                  required
                />
                {errors.safety_stock && (
                  <p role="alert" className="mt-1 text-xs text-red-700">
                    {errors.safety_stock}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="pd-img" className="mb-1 block text-sm font-medium">
                  Image URL
                </label>
                <input
                  id="pd-img"
                  type="url"
                  value={product.image_url || ''}
                  onChange={e => update('image_url', e.target.value)}
                  className={inputClass('image_url')}
                  style={inputStyle('image_url')}
                />
              </div>

              <div>
                <label htmlFor="pd-alt" className="mb-1 block text-sm font-medium">
                  Image Alt Text
                </label>
                <input
                  id="pd-alt"
                  value={product.image_alt || ''}
                  onChange={e => update('image_alt', e.target.value)}
                  className={inputClass('image_alt')}
                  style={inputStyle('image_alt')}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex flex-wrap justify-end gap-2 border-t pt-4"
          style={{ borderColor: accentBorder }}
        >
          <Link
            to="/products"
            className="rounded border px-4 py-2.5 text-sm hover:opacity-70"
            style={{ borderColor: accentBorder, color: accent }}
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </form>

      <section
        className="overflow-hidden rounded border bg-white"
        style={{ borderColor: accentBorder }}
      >
        <header
          className="flex items-center justify-between border-b p-5"
          style={{ borderColor: accentBorder }}
        >
          <div className="flex items-center gap-2">
            <Boxes size={19} style={{ color: accent }} />
            <h2 className="font-semibold">Product Variants</h2>
          </div>

          <span className="text-xs" style={{ color: accent }}>
            {product.variants?.length || 0} variant(s)
          </span>
        </header>

        {product.variants?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Product variants</caption>

              <thead
                className="text-left text-xs uppercase tracking-wider"
                style={{ backgroundColor: accentTint, color: accent }}
              >
                <tr>
                  <th scope="col" className="px-5 py-3">Variant</th>
                  <th scope="col" className="px-5 py-3">SKU</th>
                  <th scope="col" className="px-5 py-3">Size</th>
                  <th scope="col" className="px-5 py-3">Color</th>
                  <th scope="col" className="px-5 py-3">Shade</th>
                  <th scope="col" className="px-5 py-3">Scent</th>
                  <th scope="col" className="px-5 py-3">Price</th>
                  <th scope="col" className="px-5 py-3">Stock</th>
                </tr>
              </thead>

              <tbody>
                {product.variants.map(v => (
                  <tr
                    key={v.id}
                    className="border-t"
                    style={{ borderColor: accentBorder }}
                  >
                    <td className="px-5 py-3 font-medium">{v.variant_name}</td>
                    <td className="px-5 py-3 font-mono text-xs">{v.sku}</td>
                    <td className="px-5 py-3">{v.size || '—'}</td>
                    <td className="px-5 py-3">{v.color || '—'}</td>
                    <td className="px-5 py-3">{v.shade || '—'}</td>
                    <td className="px-5 py-3">{v.scent || '—'}</td>
                    <td className="whitespace-nowrap px-5 py-3">
                      ₱{Number(v.price || product.price).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <StockBadge
                        stock={v.stock}
                        safety={product.safety_stock}
                      />
                      <span className="ml-2 text-xs" style={{ color: accent }}>
                        ({v.stock})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <AlertTriangle
              size={25}
              className="mx-auto mb-2"
              style={{ color: accent }}
            />
            <p className="text-sm font-medium" style={{ color: accent }}>
              No variants available
            </p>
            <p className="mt-1 text-xs" style={{ color: accent }}>
              This product currently has no variants.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
