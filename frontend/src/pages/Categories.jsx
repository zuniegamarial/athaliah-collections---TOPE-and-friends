
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

  return (
    <div className="min-h-screen bg-[#f7f5f0] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a18b69]">
              Product Management
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#302d29]">
              Categories
            </h1>
            <p className="mt-2 text-sm text-[#81796e]">
              Organize your products into categories.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-lg bg-[#39352f] px-5 py-3 text-sm font-medium text-white hover:bg-[#514a40]"
          >
            <Plus size={17} />
            Add Category
          </button>
        </div>

        {error && !showForm && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#e9e3d8] bg-white p-5">
            <p className="text-sm text-[#81796e]">Total Categories</p>
            <p className="mt-2 text-3xl font-semibold text-[#302d29]">
              {categories.length}
            </p>
          </div>

          <div className="rounded-xl border border-[#e9e3d8] bg-white p-5">
            <p className="text-sm text-[#81796e]">Products Organized</p>
            <p className="mt-2 text-3xl font-semibold text-[#302d29]">
              {categories.reduce(
                (total, category) => total + (category.product_count || 0),
                0
              )}
            </p>
          </div>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl border border-[#e9e3d8] bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#302d29]">
                {editingId ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-[#81796e] hover:bg-[#f4f1eb]"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#514a40]">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="e.g. Skincare"
                  className="w-full rounded-lg border border-[#ded7ca] px-4 py-3 text-sm outline-none focus:border-[#a18b69]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#514a40]">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe this category..."
                  rows="3"
                  className="w-full rounded-lg border border-[#ded7ca] px-4 py-3 text-sm outline-none focus:border-[#a18b69]"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#39352f] px-5 py-3 text-sm font-medium text-white hover:bg-[#514a40] disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Save Changes'
                      : 'Create Category'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-[#ded7ca] px-5 py-3 text-sm text-[#514a40] hover:bg-[#f7f5f0]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-[#e9e3d8] bg-white">
          <div className="border-b border-[#eee9e0] px-6 py-5">
            <h2 className="font-semibold text-[#302d29]">
              All Categories
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-[#81796e]">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center">
              <FolderTree
                size={36}
                className="mx-auto mb-3 text-[#b8ad9c]"
              />
              <h3 className="font-medium text-[#302d29]">
                No categories yet
              </h3>
              <p className="mt-2 text-sm text-[#81796e]">
                Add your first category to organize your products.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#eee9e0]">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-6 py-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="rounded-lg bg-[#f4f0e8] p-3 text-[#927b57]">
                      <FolderTree size={20} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-medium text-[#302d29]">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-sm text-[#81796e]">
                        {category.description || 'No description'}
                      </p>
                      <p className="mt-1 text-xs text-[#a18b69]">
                        {category.product_count || 0} products
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditForm(category)}
                      title="Edit category"
                      className="rounded-lg border border-[#e9e3d8] p-2.5 text-[#716653] hover:bg-[#f7f5f0]"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(category)}
                      title="Delete category"
                      className="rounded-lg border border-[#f0dada] p-2.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
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
