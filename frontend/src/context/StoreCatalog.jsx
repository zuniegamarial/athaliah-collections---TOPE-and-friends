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

  const handleBuyNow = (item) => {
    const buyNowPayload = [{ ...item, quantity: 1 }];
    sessionStorage.setItem('athaliah_buynow', JSON.stringify(buyNowPayload));
    navigate('/store/checkout');
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-12 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Clean Mobile Banner */}
      <div className="bg-slate-800 border border-slate-700 p-4 sm:p-6 rounded-2xl shadow-sm">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">Featured Collection</h2>
        <p className="text-xs text-slate-400 mt-1">Explore our exclusive selection of premium items from Athaliah Collections.</p>
      </div>

      {/* Category Filter Pills (Scrollable horizontally on mobile) */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button 
            onClick={() => setSelectedCategory('')}
            style={selectedCategory === '' ? { backgroundColor: '#2563eb' } : {}}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${selectedCategory === '' ? 'text-white shadow-sm' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'}`}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={selectedCategory === cat.id ? { backgroundColor: '#2563eb' } : {}}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${selectedCategory === cat.id ? 'text-white shadow-sm' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'}`}
            >
              {cat.name} ({cat.product_count || 0})
            </button>
          ))}
        </div>
      )}

      {/* Product Grid: 1 column on mobile, 2 on small tablets, 4 on desktops */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-blue-500" size={36} />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-slate-800 p-6">
          <ShoppingBag className="mx-auto text-slate-600 mb-3" size={42} />
          <p className="text-sm font-semibold text-slate-300">No products found</p>
          <p className="text-xs text-slate-500 mt-1">Try selecting a different category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map(item => (
            <div key={item.id} className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-3.5 sm:p-4 flex flex-col justify-between hover:border-blue-500/50 transition">
              <div>
                <div className="h-44 sm:h-48 bg-slate-900 rounded-xl mb-3 sm:mb-4 flex items-center justify-center overflow-hidden relative">
                  <img src={item.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"} alt={item.name} className="h-full w-full object-cover" />
                  {item.stock <= 0 && (
                    <span className="absolute top-2 right-2 bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-md">Out of Stock</span>
                  )}
                </div>
                <h3 className="font-semibold text-white text-xs sm:text-sm line-clamp-1">{item.name}</h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-2">{item.description || "High quality merchandise from Athaliah Collections."}</p>
                <p className="text-blue-400 font-bold mt-2 text-xs sm:text-sm">₱{Number(item.price).toFixed(2)}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button 
                  onClick={() => { addToCart(item); alert(`Added ${item.name} to Cart!`); }}
                  disabled={item.stock <= 0}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 py-2 rounded-xl text-[11px] sm:text-xs font-semibold hover:bg-slate-700 transition disabled:opacity-50"
                >
                  Add to Cart
                </button>
                <button 
                  onClick={() => handleBuyNow(item)}
                  disabled={item.stock <= 0}
                  style={{ backgroundColor: '#2563eb' }}
                  className="w-full text-white py-2 rounded-xl text-[11px] sm:text-xs font-semibold hover:opacity-90 transition shadow-sm disabled:opacity-50"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}