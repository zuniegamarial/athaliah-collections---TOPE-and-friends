import { useEffect, useState } from 'react'
import { api } from '../api'
import { Plus, Pencil, Trash2, FolderTree, X } from 'lucide-react'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', description: '' })

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await api.categories()
      setCategories(data)
    } catch (err) {
      setError(err.message || 'Unable to load categories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const openAddForm = () => {
    setEditingId(null)
    setForm({ name: '', description: '' })
    setError('')
    setShowForm(true)
  }

  const openEditForm = (category) => {
    setEditingId(category.id)
    setForm({
      name: category.name || '',
      description: category.description || '',
    })
    setError('')
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Please enter a category name.')
      return
    }

    try {
      setSaving(true)

      if (editingId) {
        await api.updateCategory(editingId, form)
      } else {
        await api.createCategory(form)
      }

      setShowForm(false)
      setForm({ name: '', description: '' })
      setEditingId(null)
      await loadCategories()
    } catch (err) {
      setError(
        err.data?.errors?.name ||
        err.message ||
        'Something went wrong.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    )

    if (!confirmed) return

    try {
      await api.deleteCategory(category.id)
      await loadCategories()
    } catch (err) {
      setError(err.message || 'Unable to delete category.')
    }
  }

  const accent = 'var(--app-accent, #8A5A1C)'
  const panel = { backgroundColor: 'white', borderColor: `${accent}40` }

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6" style={{ borderColor: `${accent}30` }}>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: accent }}>
              Product management
            </p>
            <h1 className="mt-2 font-display text-3xl font-normal tracking-wide text-[#211A14]">
              Categories
            </h1>
            <p className="mt-1 text-sm text-[#6E5C48]">
              Organize your products into categories.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center gap-2 px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-white transition hover:opacity-85"
            style={{ backgroundColor: accent }}
          >
            <Plus size={16} />
            Add category
          </button>
        </div>

        {error && !showForm && (
          <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-6 shadow-sm" style={panel}>
            <p className="text-xs uppercase tracking-wider font-medium" style={{ color: accent }}>Total categories</p>
            <p className="mt-3 font-display text-4xl text-[#211A14]">
              {categories.length}
            </p>
          </div>

          <div className="rounded-xl border p-6 shadow-sm" style={panel}>
            <p className="text-xs uppercase tracking-wider font-medium" style={{ color: accent }}>Products organized</p>
            <p className="mt-3 font-display text-4xl text-[#211A14]">
              {categories.reduce(
                (total, category) => total + (category.product_count || 0),
                0
              )}
            </p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="rounded-xl border p-6 shadow-sm" style={panel}>
            <div className="mb-5 flex items-center justify-between border-b pb-4" style={{ borderColor: `${accent}30` }}>
              <h2 className="font-display text-lg text-[#211A14]">
                {editingId ? 'Edit category' : 'Add new category'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded p-2 text-[#6E5C48] transition hover:bg-[#211A14]/5"
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#4F4336]">
                  Category name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="e.g. Footwear"
                  className="w-full rounded border border-[#D2C2AA] bg-white px-4 py-3 text-sm text-[#211A14] outline-none transition focus:border-[#8A5A1C]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#4F4336]">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe this category..."
                  rows="3"
                  className="w-full rounded border border-[#D2C2AA] bg-white px-4 py-3 text-sm text-[#211A14] outline-none transition focus:border-[#8A5A1C]"
                />
              </div>

              {error && (
                <p className="text-xs text-red-700">{error}</p>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-white transition hover:opacity-85 disabled:opacity-50"
                  style={{ backgroundColor: accent }}
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Save changes'
                      : 'Create category'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded border border-[#D2C2AA] px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-[#4F4336] transition hover:bg-[#211A14]/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories list */}
        <div className="overflow-hidden rounded-xl border shadow-sm" style={panel}>
          <div className="border-b px-6 py-4" style={{ borderColor: `${accent}30`, backgroundColor: `${accent}0F` }}>
            <h2 className="font-display text-base text-[#211A14]">
              All categories
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-[#6E5C48]">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center">
              <FolderTree
                size={32}
                className="mx-auto mb-3 text-[#B3A087]"
              />
              <h3 className="font-display text-lg text-[#211A14]">
                No categories yet
              </h3>
              <p className="mt-1 text-sm text-[#6E5C48]">
                Add your first category to organize your products.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E6DBC9]">
              {categories.order_date ? null : categories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 transition hover:bg-[#211A14]/[0.02]"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className="rounded border p-3"
                      style={{ borderColor: `${accent}40`, backgroundColor: `${accent}12`, color: accent }}
                    >
                      <FolderTree size={18} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-display text-base text-[#211A14]">
                        {category.name}
                      </h3>
                      <p className="mt-0.5 text-sm text-[#6E5C48]">
                        {category.description || 'No description'}
                      </p>
                      <p className="mt-1 text-xs font-medium" style={{ color: accent }}>
                        {category.product_count || 0} products
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditForm(category)}
                      title="Edit category"
                      className="rounded border border-[#D2C2AA] p-2.5 text-[#6E5C48] transition hover:border-[#8A5A1C] hover:text-[#8A5A1C]"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      onClick={() => handleDelete(category)}
                      title="Delete category"
                      className="rounded border border-red-200 bg-red-50 p-2.5 text-red-700 transition hover:bg-red-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}