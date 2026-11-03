import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StoreCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://192.168.8.199:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleBuyNow = (item) => {
    addToCart(item);
    navigate('/store/checkout'); // Fixed: Instantly redirects straight to checkout!
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#a18b69]" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#e5e0d8] shadow-sm">
        <h1 className="text-lg font-bold text-gray-800">Featured Collection</h1>
        <span className="text-xs text-gray-500">{products.length} items available</span>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-[#e5e0d8] p-4 flex flex-col justify-between transition hover:shadow-md">
            <div>
              <div className="h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                <img 
                  src={item.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"} 
                  alt={item.name} 
                  className="h-full w-full object-cover" 
                />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
              <p className="text-[#a18b69] font-bold mt-1 text-sm">₱{item.price}</p>
            </div>

            {/* Buttons Container */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  addToCart(item);
                  alert(`Added ${item.name} to Cart!`);
                }}
                className="w-full bg-white border border-[#a18b69] text-[#a18b69] py-2 rounded-lg text-xs font-bold tracking-wider hover:bg-[#f9f6f0] transition"
              >
                Add to Cart
              </button>
              
              <button 
                onClick={() => handleBuyNow(item)}
                className="w-full bg-[#a18b69] text-white py-2 rounded-lg text-xs font-bold tracking-wider hover:bg-[#8f795a] transition shadow-sm"
              >
                Buy Now
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}