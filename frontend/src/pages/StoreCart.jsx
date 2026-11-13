import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Trash2, ArrowRight, Plus, Minus } from 'lucide-react'

const peso = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function StoreCart() {
  const { cart, subtotal, removeFromCart, updateQuantity, clearCart, clearBuyNow } = useCart()
  const navigate = useNavigate()

  const goToCheckout = () => {
    clearBuyNow() // make sure an old "Buy Now" item doesn't replace the cart
    navigate('/store/checkout')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Shopping Cart</h2>
          <p className="text-xs text-slate-300 mt-1">Review your selected items before proceeding to checkout.</p>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-300 font-semibold transition"
          >
            Clear Cart
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-16 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center mx-auto text-blue-500">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Your cart is empty</h3>
            <p className="text-xs text-slate-300 mt-1">Discover our exclusive collection and add items to your cart.</p>
          </div>
          <button
            onClick={() => navigate('/store')}
            style={{ backgroundColor: '#2563eb' }}
            className="px-6 py-2.5 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition shadow-sm inline-flex items-center gap-2"
          >
            Start Shopping <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => {
              const atMax = item.stock !== null && item.quantity >= item.stock

              return (
                <div
                  key={item.id ?? index}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-900 border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-white truncate">{item.name}</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        {peso(item.price)} each
                      </p>
                      <p className="text-sm text-blue-400 font-bold mt-0.5">
                        {peso(item.price * item.quantity)}
                      </p>
                      {item.stock !== null && item.stock <= 5 && (
                        <p className="text-[11px] text-amber-400 mt-0.5">Only {item.stock} left</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700">
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1 text-slate-300 hover:text-white transition disabled:opacity-40"
                        title="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={atMax}
                        className="p-1 text-slate-300 hover:text-white transition disabled:opacity-40"
                        title={atMax ? 'No more stock available' : 'Increase quantity'}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-slate-300 hover:text-red-400 hover:bg-slate-700/50 rounded-xl transition"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 h-fit space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-700 pb-3">Order Summary</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-semibold text-white">{peso(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Shipping</span>
                <span className="text-emerald-400 font-semibold">Free</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between text-sm font-bold text-white">
                <span>Total</span>
                <span className="text-blue-400">{peso(subtotal)}</span>
              </div>
            </div>

            <button
              onClick={goToCheckout}
              style={{ backgroundColor: '#2563eb' }}
              className="w-full text-white py-3 rounded-xl text-xs font-semibold hover:opacity-90 transition shadow-sm flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}