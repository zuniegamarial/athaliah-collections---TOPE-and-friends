import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StoreCart() {
  const { cart = [], removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const safeCart = cart || [];

  // Robust subtotal calculation checking all possible pricing keys
  const subtotal = safeCart.reduce((acc, item) => {
    const itemPrice = Number(item.price || item.unit_price || item.amount || item.retail_price || item.srp || item.cost || 0);
    const itemQty = Number(item.quantity || 1);
    return acc + (itemPrice * itemQty);
  }, 0);

  if (safeCart.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-[#e5e0d8] shadow-sm p-8 mt-6">
        <div className="w-16 h-16 bg-[#f9f6f0] text-[#a18b69] rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-lg font-bold text-gray-800">Your cart is empty</h2>
        <p className="text-xs text-gray-500 mt-1 mb-6">Discover our exclusive collection and add items to your cart.</p>
        <button
          onClick={() => navigate('/store')}
          className="bg-[#a18b69] text-white px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider hover:bg-[#8f795a] transition"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-4">
      <h1 className="text-2xl font-bold text-gray-800">Shopping Cart ({safeCart.length})</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cart Items List */}
        <div className="md:col-span-2 space-y-4">
          {safeCart.map((item, index) => {
            const itemPrice = Number(item.price || item.unit_price || item.amount || item.retail_price || item.srp || item.cost || 0);
            const itemQty = Number(item.quantity || 1);
            const itemTotal = itemPrice * itemQty;

            return (
              <div key={index} className="bg-white rounded-xl p-4 border border-[#e5e0d8] shadow-sm flex items-center gap-4">
                <img 
                  src={item.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"} 
                  alt={item.name} 
                  className="w-20 h-20 object-cover rounded-lg bg-gray-100" 
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-gray-800">{item.name || item.product_name}</h3>
                  <p className="text-[#a18b69] font-bold text-sm mt-1">₱{itemPrice.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">Quantity: {itemQty}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-700">₱{itemTotal.toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-500 p-2 transition ml-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Checkout Action */}
        <div className="bg-white rounded-xl p-6 border border-[#e5e0d8] shadow-sm h-fit space-y-4">
          <h3 className="font-bold text-sm text-gray-800 border-b pb-3">Order Summary</h3>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>₱{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span className="text-[#a18b69]">₱{subtotal.toLocaleString()}</span>
          </div>

          <button
            onClick={() => navigate('/store/checkout')}
            className="w-full bg-[#a18b69] text-white py-3 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-[#8f795a] transition shadow-sm mt-4"
          >
            Proceed to Checkout <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}