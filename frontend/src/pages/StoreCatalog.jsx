import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Loader2, ShoppingBag } from 'lucide-react';

export default function StoreCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/categories').then(res => res.json()).catch(() => [])
    ])
      .then(([prodData, catData]) => {
        setProducts(prodData || []);
        setCategories(catData || []);
      })
      .catch(err => console.error("Error loading store catalog:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(item => {
    const matchesCategory = selectedCategory === '' || String(item.category_id) === String(selectedCategory);
    return matchesCategory;
  });

  return (
    <div className="space-y-10">
      {/* Collection header */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-brass-400">The edit</p>
          <h2 className="mt-3 font-display text-3xl font-light text-slate-50 sm:text-4xl">Featured collection</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
            A short list of premium pieces, chosen for everyday wear. Prices in Philippine pesos.
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
        </p>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by category">
          <button
            onClick={() => setSelectedCategory('')}
            className={`whitespace-nowrap border px-4 py-2 text-[11px] uppercase tracking-[0.15em] transition ${
              selectedCategory === ''
                ? 'border-brass-400 bg-brass-400 text-slate-950'
                : 'border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
            }`}
          >
            All items
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap border px-4 py-2 text-[11px] uppercase tracking-[0.15em] transition ${
                selectedCategory === cat.id
                  ? 'border-brass-400 bg-brass-400 text-slate-950'
                  : 'border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              {cat.name} ({cat.product_count || 0})
            </button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-brass-400" size={30} />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="border border-slate-800 px-6 py-20 text-center">
          <ShoppingBag className="mx-auto mb-4 text-slate-600" size={36} />
          <p className="font-display text-xl text-slate-200">Nothing in this edit yet</p>
          <p className="mt-2 text-xs text-slate-500">Try another category, or check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map(item => (
            <article key={item.id} className="group flex flex-col justify-between">
              <div>
                <div className="relative aspect-[4/5] overflow-hidden border border-slate-800 bg-slate-950">
                  <img
                    src={item.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  {item.stock <= 0 && (
                    <span className="absolute top-0 left-0 bg-slate-950/90 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                      Sold out
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-base font-normal text-slate-100 line-clamp-1">{item.name}</h3>
                  <p className="shrink-0 text-xs tracking-wider text-brass-300">₱{Number(item.price).toLocaleString()}</p>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-slate-500 line-clamp-2">
                  {item.description || "High quality merchandise from Athaliah Collections."}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => { addToCart(item); alert(`Added ${item.name} to Cart!`); }}
                  disabled={item.stock <= 0}
                  className="w-full border border-slate-700 py-2.5 text-[11px] uppercase tracking-[0.12em] text-slate-200 transition hover:border-slate-400 hover:text-white disabled:opacity-40"
                >
                  Add to cart
                </button>
                <button
                  onClick={() => navigate('/store/checkout', { state: { product: item } })}
                  disabled={item.stock <= 0}
                  className="w-full bg-brass-400 py-2.5 text-[11px] uppercase tracking-[0.12em] text-slate-950 transition hover:bg-brass-300 disabled:opacity-40"
                >
                  Buy now
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}