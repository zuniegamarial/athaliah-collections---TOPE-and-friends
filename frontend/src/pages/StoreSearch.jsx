import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function StoreSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      setLoading(true);
      fetch(`http://192.168.8.199:5000/api/products?q=${text}`)
        .then(res => res.json())
        .then(data => setProducts(data))
        .catch(err => console.log("Search error:", err))
        .finally(() => setLoading(false));
    } else {
      setProducts([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Search Input Bar */}
      <div className="relative max-w-xl mx-auto mb-8">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
          <Search size={20} />
        </span>
        <input
          type="text"
          placeholder="Search Athaliah Collections..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          autoFocus
          className="w-full bg-white pl-12 pr-4 py-3 rounded-full border border-[#e5e0d8] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#a18b69] text-sm"
        />
      </div>

      {loading && (
        <div className="flex justify-center my-6">
          <Loader2 className="animate-spin text-[#a18b69]" size={28} />
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-[#e5e0d8] p-4 flex flex-col justify-between">
            <div>
              <div className="h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                <img src={item.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
              <p className="text-[#a18b69] font-bold mt-1">₱{item.price}</p>
            </div>
            <button 
              onClick={() => { addToCart(item); alert(`Added ${item.name} to Cart!`); }}
              className="mt-4 w-full bg-[#a18b69] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#8f795a] transition"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {!loading && searchQuery.length > 0 && products.length === 0 && (
        <p className="text-center text-gray-500 mt-12">No products found matching "{searchQuery}"</p>
      )}
      {!searchQuery && (
        <p className="text-center text-gray-400 mt-12">Type above to search products across collections</p>
      )}
    </div>
  );
}