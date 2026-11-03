import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Search, User, ClipboardList } from 'lucide-react';

export default function StoreCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProducts([
        { id: 1, name: "Classic Sneakers", price: 1299.00 },
        { id: 2, name: "Athaliah Signature Perfume", price: 450.00 }
      ]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f9f6f0]">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e5e0d8] bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 tracking-wide">Athaliah Collections</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/store/orders')} className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-[#a18b69]">
            <ClipboardList size={18} /> Orders
          </button>
          <button onClick={() => navigate('/store/cart')} className="relative flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-[#a18b69]">
            <ShoppingBag size={18} /> Cart
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#a18b69] text-xs text-white">
                {cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
              </span>
            )}
          </button>
          <button onClick={() => navigate('/store/profile')} className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-[#a18b69]">
            <User size={18} /> Profile
          </button>
        </div>
      </header>

      {/* Main Catalog Grid */}
      <main className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex justify-center mt-20"><div className="animate-spin h-8 w-8 border-4 border-[#a18b69] border-t-transparent rounded-full" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-[#e5e0d8] p-4 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    <img src={item.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-[#a18b69] font-bold mt-1">₱{item.price}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => { addToCart(item); alert(`Added ${item.name} to Cart!`); }}
                    className="flex-1 bg-white border border-[#a18b69] text-[#a18b69] py-2 rounded-lg text-sm font-semibold hover:bg-[#a18b69] hover:text-white transition"
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => navigate('/store/checkout', { state: { product: item } })}
                    className="flex-1 bg-[#a18b69] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#8f795a] transition"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}