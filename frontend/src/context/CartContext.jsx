import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)

const cartKey = (user) => `athaliah_cart_${user || 'guest'}`

// ---- price / item helpers (shared with Checkout and Cart pages) ----
export function extractPrice(item) {
  if (!item) return 0
  const raw =
    item.price ?? item.unit_price ?? item.amount ?? item.retail_price ??
    item.srp ?? item.cost ?? item.unitPrice ?? item.retailPrice ?? 0

  if (typeof raw === 'object' && raw !== null) {
    return Number(raw.$numberDecimal || raw.value || raw.amount || 0)
  }
  if (typeof raw === 'string') {
    return Number(raw.replace(/[^0-9.-]+/g, '')) || 0
  }
  return Number(raw) || 0
}

export function normalizeItem(item, quantity) {
  const stock = item.stock ?? item.current_stock
  return {
    ...item,
    id: item.id ?? item.product_id ?? item._id,
    name: item.name || item.product_name || item.title || 'Product',
    price: extractPrice(item),
    image_url: item.image_url || item.image || item.img || '',
    stock: stock === undefined || stock === null ? null : Number(stock),
    quantity: Math.max(1, Number(quantity ?? item.quantity ?? item.qty ?? 1) || 1),
  }
}

const sameItem = (a, b) =>
  a.id !== undefined && a.id !== null && b.id !== undefined && b.id !== null
    ? String(a.id) === String(b.id)
    : a.name === b.name

function readList(key) {
  try {
    const raw = localStorage.getItem(key) || sessionStorage.getItem(key)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.map(i => normalizeItem(i)) : []
  } catch {
    return []
  }
}

function mergeCarts(base, extra) {
  const result = [...base]
  extra.forEach(item => {
    const idx = result.findIndex(i => sameItem(i, item))
    if (idx > -1) {
      const max = result[idx].stock ?? Infinity
      result[idx] = { ...result[idx], quantity: Math.min(result[idx].quantity + item.quantity, max) }
    } else {
      result.push(item)
    }
  })
  return result
}

export function CartProvider({ children }) {
  const [sessionUser, setSessionUser] = useState(null)
  const [cart, setCart] = useState(() => readList(cartKey(null)))
  const [ready, setReady] = useState(false)

  // Look up who is signed in. Call again right after login/logout.
  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/current_user', { credentials: 'include', headers: { 'X-Portal': 'store' } })
      if (!res.ok) throw new Error('Not logged in')
      const data = await res.json()
      if (data.role !== 'customer') throw new Error('Not a customer')

      const merged = mergeCarts(readList(cartKey(data.username)), readList(cartKey(null)))
      localStorage.removeItem(cartKey(null))
      setSessionUser(data.username)
      setCart(merged)
      setReady(true)
      return data
    } catch {
      setSessionUser(null)
      setCart(readList(cartKey(null)))
      setReady(true)
      return null
    }
  }, [])

  const resetSession = useCallback(() => {
    setSessionUser(null)
    setCart(readList(cartKey(null)))
  }, [])

  useEffect(() => { refreshSession() }, [refreshSession])

  // Save the cart for whoever is signed in (or the guest)
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(cartKey(sessionUser), JSON.stringify(cart))
    } catch { /* storage full or blocked */ }
  }, [cart, sessionUser, ready])

  const addToCart = (product) => {
    const add = Math.max(1, Number(product.quantity) || 1)
    const item = normalizeItem(product, add)

    if (item.stock !== null && item.stock <= 0) {
      return { ok: false, reason: 'This item is out of stock.' }
    }

    setCart(prev => {
      const idx = prev.findIndex(i => sameItem(i, item))
      if (idx > -1) {
        const max = item.stock ?? prev[idx].stock ?? Infinity
        return prev.map((i, n) =>
          n === idx
            ? { ...i, stock: item.stock ?? i.stock, quantity: Math.min(i.quantity + add, max) }
            : i
        )
      }
      return [...prev, { ...item, quantity: Math.min(item.quantity, item.stock ?? Infinity) }]
    })
    return { ok: true }
  }

  const updateQuantity = (productId, quantity) => {
    setCart(prev =>
      prev.map(i => {
        if (String(i.id) !== String(productId)) return i
        const max = i.stock ?? Infinity
        return { ...i, quantity: Math.min(Math.max(1, Number(quantity) || 1), max) }
      })
    )
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => String(i.id) !== String(productId)))
  }

  const clearCart = () => setCart([])

  // "Buy Now" items saved by the catalog page (checked across localStorage and sessionStorage)
  const buyNowKeys = () => {
    const names = [
      sessionUser,
      localStorage.getItem('athaliah_active_user'),
      localStorage.getItem('username'),
    ].filter(Boolean)
    return [...new Set([...names.map(n => `athaliah_buynow_${n}`), 'athaliah_buynow'])]
  }

  const getBuyNowItems = () => {
    for (const key of buyNowKeys()) {
      const items = readList(key)
      if (items.length > 0) return items
    }
    // Also check generic session storage fallback keys
    try {
      const raw = sessionStorage.getItem('athaliah_buynow')
      if (raw) {
        const arr = JSON.parse(raw)
        if (Array.isArray(arr) && arr.length > 0) return arr.map(i => normalizeItem(i))
      }
    } catch {
      // ignore
    }
    return []
  }

  const clearBuyNow = () => {
    buyNowKeys().forEach(k => {
      localStorage.removeItem(k)
      sessionStorage.removeItem(k)
    })
    sessionStorage.removeItem('athaliah_buynow')
    Object.keys(localStorage)
      .filter(k => k.startsWith('athaliah_buynow'))
      .forEach(k => localStorage.removeItem(k))
  }

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart, cartItems: cart, cartCount, subtotal, ready, username: sessionUser,
        addToCart, updateQuantity, removeFromCart, clearCart,
        getBuyNowItems, clearBuyNow, refreshSession, resetSession,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}