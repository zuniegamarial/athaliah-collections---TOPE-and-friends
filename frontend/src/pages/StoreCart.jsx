import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from 'lucide-react'

const peso = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const buttonClass =
  'inline-flex items-center justify-center whitespace-nowrap min-h-[40px] sm:min-h-[44px] px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'

const iconButtonClass =
  'inline-flex items-center justify-center whitespace-nowrap min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] px-2 py-2.5 text-xs sm:text-sm rounded-xl transition duration-200 active:scale-[0.98]'

export default function StoreCart() {
  const { cart, subtotal, removeFromCart, updateQuantity, clearCart, clearBuyNow } = useCart()
  const navigate = useNavigate()
  const accent = 'var(--app-accent, #8A5A1C)'
  const accentTint = 'color-mix(in srgb, var(--app-accent, #8A5A1C) 14%, transparent)'
  const itemCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)

  const goToCheckout = () => {
    clearBuyNow()
    navigate('/store/checkout')
  }

  return (
    <div className="w-full max-w-full min-w-0 space-y-5 pb-12 sm:space-y-6">
      <div className="mx-auto w-full max-w-5xl min-w-0 space-y-5 sm:space-y-6">
        <div
          className="relative w-full max-w-full min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-800 p-5 shadow-xl sm:p-7"
          style={{ backgroundColor: 'color-mix(in srgb, var(--app-accent, #8A5A1C) 8%, #1e293b)' }}
        >
          <div
            className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full opacity-20 blur-2xl"
            style={{ backgroundColor: accent }}
          />
          <div className="relative flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] sm:text-xs" style={{ color: accent }}>
                Cart / Checkout
              </p>
              <h1 className="mt-2 break-words text-2xl font-semibold text-white sm:text-3xl">
                Your Cart
              </h1>
              <p className="mt-1 break-words text-xs text-slate-300 sm:text-sm">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} selected. Review everything before checkout.
              </p>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className={`${buttonClass} w-full border border-red-500/30 bg-red-500/10 text-red-300 hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-200 sm:w-auto`}
              >
                <Trash2 size={15} />
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="w-full max-w-full min-w-0 rounded-3xl border border-white/10 bg-slate-800 px-4 py-12 text-center shadow-xl sm:py-16">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl sm:h-20 sm:w-20"
              style={{ backgroundColor: accentTint, color: accent }}
            >
              <ShoppingBag size={30} />
            </div>
            <h2 className="mt-5 break-words text-lg font-semibold text-white sm:text-xl">
              Your cart is waiting
            </h2>
            <p className="mx-auto mt-2 max-w-md break-words text-xs leading-relaxed text-slate-400 sm:text-sm">
              Browse the collection and add the pieces you love. Your selections will appear here.
            </p>
            <button
              onClick={() => navigate('/store')}
              className={`${buttonClass} mt-6 w-full text-[#0b0f13] shadow-lg hover:brightness-110 hover:shadow-xl sm:w-auto`}
              style={{ backgroundColor: accent }}
            >
              Start Shopping <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div className="grid w-full max-w-full min-w-0 grid-cols-1 gap-5 lg:grid-cols-3 sm:gap-6">
            <div className="min-w-0 space-y-4 lg:col-span-2">
              {cart.map((item, index) => {
                const atMax = item.stock !== null && item.quantity >= item.stock
                const lowStock = item.stock !== null && item.stock <= 5

                return (
                  <article
                    key={item.id ?? index}
                    className="group w-full max-w-full min-w-0 rounded-2xl border border-white/10 bg-slate-800 p-4 shadow-lg transition hover:border-white/20 sm:p-5"
                  >
                    <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 sm:h-24 sm:w-24">
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'}
                            alt={item.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
                            {item.sku || 'Selected item'}
                          </p>
                          <h2
                            className="mt-1 break-words text-sm font-semibold text-white sm:text-base"
                            title={item.name}
                          >
                            {item.name}
                          </h2>
                          <p className="mt-1 break-words text-xs text-slate-400">
                            {peso(item.price)} each
                          </p>
                          <p className="mt-2 whitespace-nowrap text-sm font-bold" style={{ color: accent }}>
                            {peso(item.price * item.quantity)}
                          </p>
                          {lowStock && (
                            <p className="mt-1 text-[11px] font-medium text-amber-300">
                              Only {item.stock} left in stock
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex w-full min-w-0 items-center justify-between gap-3 border-t border-white/10 pt-3 sm:w-auto sm:justify-end sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                        <div className="inline-flex items-center rounded-xl border border-white/10 bg-slate-900 p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className={`${iconButtonClass} text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40`}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-white sm:text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={atMax}
                            className={`${iconButtonClass} text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40`}
                            aria-label={atMax ? 'No more stock available' : 'Increase quantity'}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className={`${iconButtonClass} border border-white/10 bg-white/5 text-slate-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300`}
                          aria-label="Remove item"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            <aside className="h-fit min-w-0 rounded-3xl border border-white/10 bg-slate-800 shadow-xl lg:sticky lg:top-24">
              <div
                className="flex items-center gap-3 border-b border-white/10 p-5 sm:p-6"
                style={{ background: `linear-gradient(135deg, ${accentTint}, transparent)` }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: accentTint, color: accent }}
                >
                  <PackageCheck size={20} />
                </div>
                <div className="min-w-0">
                  <h2 className="break-words text-sm font-semibold text-white sm:text-base">
                    Order Summary
                  </h2>
                  <p className="break-words text-[11px] text-slate-400 sm:text-xs">
                    Delivery details come next.
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-slate-300">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                    <span className="whitespace-nowrap font-semibold text-white">{peso(subtotal)}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-slate-300">
                    <span>Shipping</span>
                    <span className="whitespace-nowrap font-semibold text-emerald-300">Free</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-white/15 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-white">Total</span>
                    <span className="whitespace-nowrap text-xl font-bold" style={{ color: accent }}>
                      {peso(subtotal)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={goToCheckout}
                  className={`${buttonClass} w-full text-[#0b0f13] shadow-lg hover:brightness-110 hover:shadow-xl`}
                  style={{ backgroundColor: accent }}
                >
                  Proceed to Checkout <ArrowRight size={15} />
                </button>

                <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] leading-relaxed text-slate-400">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0" style={{ color: accent }} />
                  <span className="min-w-0 break-words">
                    You can review your address and delivery details before placing the order.
                  </span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
