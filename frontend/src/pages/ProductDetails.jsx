import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { api } from '../api'
import Notification from '../components/Notification'
import { StockBadge } from '../components/StatusBadge'

export default function ProductDetails() {
  const { id } = useParams()
  const nav = useNavigate()
  const [product, setProduct] = useState(null)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)

  const load = () =>
    api.product(id)
      .then(setProduct)
      .catch(() => setNotice({ type: 'error', message: 'Product not found.' }))
  useEffect(() => { load() }, [id])

  if (!product) return <p>Loading product…</p>

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

  const update = (key, value) => setProduct(p => ({ ...p, [key]: value }))

  const inputClass = (field) =>
    `w-full border rounded px-3 py-2 ${errors[field] ? 'border-red-500' : 'border-gray-300'}`

  return (
    <div className="space-y-5">
      {notice && <Notification {...notice} onClose={() => setNotice(null)} />}

      <div className="flex items-center justify-between">
        <Link to="/products" className="inline-flex items-center gap-2 text-brand-700 hover:underline">
          <ArrowLeft size={16} aria-hidden="true" /> Back to Products
        </Link>
        <button
          onClick={removeProduct}
          className="inline-flex items-center gap-2 text-red-700 hover:underline"
        >
          <Trash2 size={16} aria-hidden="true" /> Delete Product
        </button>
      </div>

      <form onSubmit={save} noValidate className="bg-white rounded shadow-sm p-6 space-y-4">
        <header>
          <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-500 font-mono">{product.sku}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.image_alt || product.name}
                className="w-full rounded border border-gray-200 object-cover"
              />
            )}
            <p className="text-xs text-gray-500 mt-2">
              Alt text: “{product.image_alt || product.name}”
            </p>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div>
              <label htmlFor="pd-name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                id="pd-name"
                value={product.name}
                onChange={e => update('name', e.target.value)}
                className={inputClass('name')}
                required
              />
              {errors.name && <p role="alert" className="text-xs text-red-700 mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pd-sku" className="block text-sm font-medium text-gray-700 mb-1">
                  SKU *
                </label>
                <input
                  id="pd-sku"
                  value={product.sku}
                  onChange={e => update('sku', e.target.value)}
                  className={inputClass('sku')}
                  required
                />
                {errors.sku && <p role="alert" className="text-xs text-red-700 mt-1">{errors.sku}</p>}
              </div>
              <div>
                <label htmlFor="pd-status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="pd-status"
                  value={product.status}
                  onChange={e => update('status', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Out of Stock</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="pd-desc" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="pd-desc"
                rows="2"
                value={product.description || ''}
                onChange={e => update('description', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="pd-price" className="block text-sm font-medium text-gray-700 mb-1">
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
                  required
                />
                {errors.price && <p role="alert" className="text-xs text-red-700 mt-1">{errors.price}</p>}
              </div>
              <div>
                <label htmlFor="pd-stock" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  id="pd-stock"
                  type="number"
                  min="0"
                  value={product.stock}
                  onChange={e => update('stock', e.target.value)}
                  className={inputClass('stock')}
                  required
                />
                {errors.stock && <p role="alert" className="text-xs text-red-700 mt-1">{errors.stock}</p>}
              </div>
              <div>
                <label htmlFor="pd-safety" className="block text-sm font-medium text-gray-700 mb-1">
                  Safety Stock *
                </label>
                <input
                  id="pd-safety"
                  type="number"
                  min="0"
                  value={product.safety_stock}
                  onChange={e => update('safety_stock', e.target.value)}
                  className={inputClass('safety_stock')}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pd-img" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  id="pd-img"
                  type="url"
                  value={product.image_url || ''}
                  onChange={e => update('image_url', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="pd-alt" className="block text-sm font-medium text-gray-700 mb-1">
                  Image Alt Text
                </label>
                <input
                  id="pd-alt"
                  value={product.image_alt || ''}
                  onChange={e => update('image_alt', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Link
                to="/products"
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded font-medium"
              >
                <Save size={16} aria-hidden="true" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </form>

      <section aria-labelledby="variants-heading" className="bg-white rounded shadow-sm">
        <header className="px-5 py-4 border-b border-gray-200">
          <h2 id="variants-heading" className="font-semibold text-gray-800">
            Variants ({product.variants?.length || 0})
          </h2>
        </header>

        {product.variants?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Product variants</caption>
              <thead className="bg-gray-50 text-left text-gray-600 uppercase text-xs">
                <tr>
                  <th scope="col" className="px-4 py-2">Variant</th>
                  <th scope="col" className="px-4 py-2">SKU</th>
                  <th scope="col" className="px-4 py-2">Size</th>
                  <th scope="col" className="px-4 py-2">Color</th>
                  <th scope="col" className="px-4 py-2">Shade</th>
                  <th scope="col" className="px-4 py-2">Scent</th>
                  <th scope="col" className="px-4 py-2">Price</th>
                  <th scope="col" className="px-4 py-2">Stock</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map(v => (
                  <tr key={v.id} className="border-t border-gray-100">
                    <td className="px-4 py-2 font-medium">{v.variant_name}</td>
                    <td className="px-4 py-2 font-mono text-xs">{v.sku}</td>
                    <td className="px-4 py-2">{v.size || '—'}</td>
                    <td className="px-4 py-2">{v.color || '—'}</td>
                    <td className="px-4 py-2">{v.shade || '—'}</td>
                    <td className="px-4 py-2">{v.scent || '—'}</td>
                    <td className="px-4 py-2">₱{Number(v.price || product.price).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <StockBadge stock={v.stock} safety={product.safety_stock} />
                      <span className="ml-2 text-xs text-gray-600">({v.stock})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-5 text-sm text-gray-500">This product has no variants.</p>
        )}
      </section>
    </div>
  )
}