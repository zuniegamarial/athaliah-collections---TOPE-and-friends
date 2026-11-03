import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ArrowLeft } from 'lucide-react';

export default function StoreCart() {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const calculateTotal = () => cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  return (
    <div className="min-h-screen bg-[#f9f6f0] p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-[#e5e0d8] p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#e5e0d8]">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-black">
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-xl font-bold text-gray-800">Your Cart</h1>
          {cartItems.length > 0 && (
            <button onClick={clearCart} className="text-sm font-semibold text-red-500 hover:underline">Clear All</button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Your cart is empty.</div>
        ) : (
          <div>
            <div className="divide-y divide-gray-100 my-4">
              {cartItems.map(item => (
                <div key={item.id} className="py-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">₱{item.price} x {item.quantity || 1}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-[#e5e0d8] flex justify-between items-center mb-6">
              <span className="text-lg font-semibold text-gray-700">Total:</span>
              <span className="text-xl font-bold text-[#a18b69]">₱{calculateTotal().toFixed(2)}</span>
            </div>
            <button 
              onClick={() => navigate('/store/checkout')}
              className="w-full bg-[#a18b69] text-white py-3 rounded-xl font-bold hover:bg-[#8f795a] transition"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}