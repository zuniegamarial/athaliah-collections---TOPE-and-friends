import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import {
  CheckCircle2, Check, Copy, Receipt, Package, ArrowLeft, MapPin, Phone, CreditCard, Plus, QrCode, Loader2, ShoppingBag,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { api } from '../api'
import LocationPicker from '../components/LocationPicker'
import { STORE_LOCATION } from '../config'

const peso = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const buttonClass =
  'inline-flex items-center justify-center whitespace-nowrap min-h-[40px] sm:min-h-[44px] px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'

const inputClass =
  'w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition'

const isValidPhone = (v) => /^(09\d{9}|\+639\d{9})$/.test(v.replace(/[\s-]/g, ''))

export default function StoreCheckout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cart, clearCart, clearBuyNow } = useCart()

  // 1. Check if Buy Now data exists in session/local storage
  const [buyNowItems, setBuyNowItems] = useState(() => {
    try {
      const bn = sessionStorage.getItem('athaliah_buynow') || localStorage.getItem('athaliah_buynow')
      if (bn) {
        const parsed = JSON.parse(bn)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      // ignore
    }
    return []
  })

  // Also check if navigation state indicates buy now
  const isBuyNowRoute = Boolean(location.state?.product) || buyNowItems.length > 0
  const usingBuyNow = isBuyNowRoute
  const items = usingBuyNow ? (buyNowItems.length > 0 ? buyNowItems : [location.state.product]) : cart
  const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0)

  // Profile (addresses + phones live on the server)
  const [profile, setProfile] = useState(null)
  const [needsLogin, setNeedsLogin] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [addingAddress, setAddingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState('')
  const [deliveryPin, setDeliveryPin] = useState(null)
  const [locating, setLocating] = useState(false)
  
  // Phone selection state
  const [phones, setPhones] = useState([])
  const [selectedPhone, setSelectedPhone] = useState('')
  const [addingPhone, setAddingPhone] = useState(false)
  const [newPhone, setNewPhone] = useState('')

  useEffect(() => {
    api.profile()
      .then(p => {
        setProfile(p)
        const initialPhones = p.phones && p.phones.length > 0 ? p.phones : (p.phone ? [{ id: 1, phone: p.phone }] : [])
        setPhones(initialPhones)
        if (initialPhones.length > 0) {
          setSelectedPhone(initialPhones[initialPhones.length - 1].phone)
        } else {
          setAddingPhone(true)
        }
        if (p.addresses.length > 0) setSelectedAddressId(p.addresses[p.addresses.length - 1].id)
        else setAddingAddress(true)
      })
      .catch(err => { if ((err.status === 401 || err.status === 403)) setNeedsLogin(true) })
  }, [])

  useEffect(() => {
    const address = addresses.find(a => a.id === selectedAddressId)
    if (address?.latitude != null && address?.longitude != null) {
      setDeliveryPin([address.latitude, address.longitude])
    } else {
      setDeliveryPin(null)
    }
  }, [selectedAddressId, profile])

  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [paymentReference, setPaymentReference] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [placed, setPlaced] = useState(null)
  const [copied, setCopied] = useState(false)

  const addresses = profile?.addresses || []
  const selectedAddress = addresses.find(a => a.id === selectedAddressId)?.address || ''

  const saveAddress = async () => {
    setErrorMsg('')
    if (!newAddress.trim()) return setErrorMsg('Please enter a valid address.')
    if (!deliveryPin) return setErrorMsg('Drop the customer pin on the map first.')
    try {
      const updated = await api.addAddress(newAddress, deliveryPin[0], deliveryPin[1])
      setProfile(updated)
      setSelectedAddressId(updated.addresses[updated.addresses.length - 1].id)
      setNewAddress('')
      setAddingAddress(false)
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  const useCurrentLocation = () => {
    setErrorMsg('')
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not available in this browser.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const pin = [Number(coords.latitude), Number(coords.longitude)]
        setDeliveryPin(pin)
        let address = `Current location (${pin[0].toFixed(5)}, ${pin[1].toFixed(5)})`
        try {
          const geo = await api.reverseGeocode(pin[0], pin[1])
          address = geo.address || address
        } catch {
          setErrorMsg('Address lookup was unavailable. Review the pin and address before saving.')
        }
        setNewAddress(address)
        setLocating(false)
      },
      () => {
        setLocating(false)
        setErrorMsg('Could not get your current location. Allow location access and try again.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const savePhone = async () => {
    setErrorMsg('')
    if (!isValidPhone(newPhone)) {
      return setErrorMsg('Enter a valid mobile number, for example 09123456789.')
    }
    try {
      const trimmed = newPhone.trim()
      const updatedPhones = [...phones, { id: Date.now(), phone: trimmed }]
      const updated = await api.updateProfile({ phone: trimmed })
      setProfile(updated)
      setPhones(updatedPhones)
      setSelectedPhone(trimmed)
      setNewPhone('')
      setAddingPhone(false)
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  const placeOrder = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (items.length === 0) return setErrorMsg('There are no items to check out.')
    if (!selectedAddress) return setErrorMsg('Please add and select a shipping address.')
    if (!deliveryPin) return setErrorMsg('Drop the customer pin on the map first.')
    if (!isValidPhone(selectedPhone)) return setErrorMsg('Enter a valid mobile number, for example 09123456789.')
    if (paymentMethod !== 'COD' && !paymentReference.trim()) {
      return setErrorMsg(`Enter your ${paymentMethod} reference number.`)
    }

    setLoading(true)
    try {
      const orderItems = items.map(i => ({
        product_id: i.id || i.product_id,
        product_name: i.name || i.product_name || 'Athaliah item',
        quantity: i.quantity || 1,
        price: i.price || 0,
      }))
      const res = await api.createOrder({
        payment_method: paymentMethod,
        payment_reference: paymentReference.trim(),
        shipping_address: selectedAddress,
        destination_lat: deliveryPin[0],
        destination_lng: deliveryPin[1],
        contact_phone: selectedPhone.trim(),
        items: orderItems,
      })

      if (usingBuyNow) {
        sessionStorage.removeItem('athaliah_buynow')
        localStorage.removeItem('athaliah_buynow')
        clearBuyNow()
      } else {
        clearCart()
        clearBuyNow()
      }
      setPlaced({
        orderNumber: res.order_number,
        total: res.total ?? subtotal,
        method: paymentMethod,
        reference: paymentReference.trim(),
        address: selectedAddress,
        items: orderItems,
        placedAt: new Date().toLocaleString('en-PH', {
          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        }),
      })
    } catch (err) {
      if ((err.status === 401 || err.status === 403)) setNeedsLogin(true)
      setErrorMsg(
        err.status
          ? err.message
          : 'Cannot reach the server. Your order was not placed. Make sure the backend is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  const copyOrderNumber = async () => {
    if (!placed?.orderNumber) return
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(placed.orderNumber)
      } else {
        const field = document.createElement('textarea')
        field.value = placed.orderNumber
        field.style.position = 'fixed'
        field.style.opacity = '0'
        document.body.appendChild(field)
        field.select()
        document.execCommand('copy')
        document.body.removeChild(field)
      }
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  /* ---------------- success screen ---------------- */
  if (placed) {
    const receiptItems = Array.isArray(placed.items) ? placed.items : []
    const totalQty = receiptItems.reduce((n, i) => n + (i.quantity || 1), 0)

    return (
      <div className="w-full max-w-full min-w-0 space-y-4 pb-12">
        <div className="mx-auto w-full max-w-2xl min-w-0 space-y-5 pt-8 sm:pt-10">
          <div className="overflow-hidden rounded-3xl border border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl">
            <div className="border-b border-dashed border-slate-700 bg-slate-800/60 px-5 pb-7 pt-8 text-center sm:px-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.05)]">
                <CheckCircle2 size={38} strokeWidth={2.2} />
              </div>
              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.28em] text-amber-300">Order confirmed</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Order Placed Successfully!</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Your order is now <span className="font-bold text-amber-400">Pending</span> review by the admin.
              </p>
            </div>

            <div className="space-y-5 p-4 sm:p-8">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/50 shadow-inner">
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-700/70 px-4 py-4 sm:px-5">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    <Receipt size={15} className="shrink-0 text-amber-400" /> Order receipt
                  </p>
                  <span className="break-words text-[10px] text-slate-500">{placed.placedAt}</span>
                </div>

                <div className="space-y-5 px-4 py-5 sm:px-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-dashed border-slate-700 pb-5">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Order number</p>
                      <p className="mt-1 break-all font-mono text-lg font-extrabold tracking-wide text-amber-300">{placed.orderNumber}</p>
                    </div>
                    <button
                      type="button"
                      onClick={copyOrderNumber}
                      className={`${buttonClass} w-full gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-[11px] font-semibold text-slate-300 hover:border-amber-500/60 hover:bg-amber-500/10 hover:text-white sm:w-auto`}
                    >
                      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        <MapPin size={12} className="shrink-0 text-emerald-400" /> Delivery address
                      </p>
                      <p className="mt-2 break-words text-sm leading-relaxed text-slate-200">{placed.address || '—'}</p>
                    </div>
                    <div className="min-w-0 space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs">
                      <div className="flex flex-wrap justify-between gap-2">
                        <span className="text-slate-500">Payment</span>
                        <span className="break-words font-semibold text-white">{placed.method}</span>
                      </div>
                      {placed.method !== 'COD' && placed.reference && (
                        <div className="flex flex-wrap justify-between gap-2">
                          <span className="text-slate-500">Reference</span>
                          <span className="break-all font-semibold text-white">{placed.reference}</span>
                        </div>
                      )}
                      <div className="flex flex-wrap justify-between gap-2">
                        <span className="text-slate-500">Items</span>
                        <span className="font-semibold text-white">{totalQty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-slate-700 pt-5">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        <Package size={12} className="shrink-0 text-blue-400" /> Item summary
                      </p>
                      <span className="text-[11px] text-slate-500">{receiptItems.length} line(s)</span>
                    </div>
                    <div className="space-y-3">
                      {receiptItems.map((item, idx) => (
                        <div key={`${item.product_id ?? 'item'}-${idx}`} className="flex min-w-0 items-start justify-between gap-3 text-xs">
                          <div className="flex min-w-0 items-start gap-2">
                            <span className="mt-0.5 shrink-0 rounded-md border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-blue-300">{item.quantity}×</span>
                            <p className="truncate text-slate-200" title={item.product_name}>{item.product_name}</p>
                          </div>
                          <p className="shrink-0 whitespace-nowrap font-semibold text-white">{peso(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-3 border-t border-dashed border-slate-700 pt-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Total due</p>
                      <p className="mt-1 break-words text-[11px] text-slate-400">
                        {placed.method === 'COD' ? 'Pay on delivery' : 'Payment verification pending'}
                      </p>
                    </div>
                    <p className="shrink-0 whitespace-nowrap text-2xl font-extrabold text-blue-400">{peso(placed.total)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={() => navigate('/store/orders')}
                  style={{ backgroundColor: '#8F5A1D' }}
                  className={`${buttonClass} w-full font-bold tracking-wider text-white hover:brightness-110 hover:shadow-lg hover:shadow-amber-900/30`}
                >
                  View My Orders
                </button>
                <button
                  onClick={() => navigate('/store')}
                  className={`${buttonClass} w-full border border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500 hover:bg-slate-800 hover:text-white`}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ---------------- not signed in ---------------- */
  if (needsLogin) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center space-y-4">
        <ShoppingBag className="mx-auto text-indigo-400" size={36} />
        <h2 className="text-lg font-bold text-white">Please sign in to check out</h2>
        <p className="text-sm text-slate-300">Sign in with your customer account.</p>
        <Link
          to="/store-auth"
          style={{ backgroundColor: '#8F5A1D' }}
          className="inline-block text-white px-6 py-3 rounded-xl text-xs font-bold tracking-wider hover:opacity-90 transition"
        >
          SIGN IN
        </Link>
      </div>
    )
  }

  /* ---------------- checkout form ---------------- */
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Dynamic Back Button based on entry route */}
      <button
        onClick={() => navigate(usingBuyNow ? '/store' : '/store/cart')}
        className="flex items-center gap-2 text-xs text-indigo-300 font-medium hover:underline"
      >
        <ArrowLeft size={14} /> {usingBuyNow ? 'Back to Home' : 'Back to Cart'}
      </button>

      {errorMsg && (
        <div role="alert" className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Shipping Details Container */}
          <form onSubmit={placeOrder} id="checkout-form" className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3">Shipping Details</h2>

            {/* Shipping Address */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <MapPin size={14} className="text-indigo-400" /> Shipping Address
              </p>

              {addresses.length > 0 && !addingAddress ? (
                <div className="space-y-2">
                  {addresses.map(a => (
                    <label
                      key={a.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-sm cursor-pointer transition ${
                        selectedAddressId === a.id ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-700/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === a.id}
                        onChange={() => setSelectedAddressId(a.id)}
                        className="accent-indigo-500"
                      />
                      <span>{a.address}</span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAddingAddress(true)}
                    className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold mt-1 hover:underline"
                  >
                    <Plus size={14} /> Add another address
                  </button>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                  <textarea
                    rows={2}
                    placeholder="Complete delivery address (house no., street, barangay, city)"
                    value={newAddress}
                    onChange={e => setNewAddress(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    disabled={locating}
                    className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold hover:underline disabled:opacity-50"
                  >
                    {locating ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                    {locating ? 'Getting your location...' : 'Use my current location'}
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveAddress}
                      style={{ backgroundColor: '#8F5A1D' }}
                      className="text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition"
                    >
                      Save Address
                    </button>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => { setAddingAddress(false); setNewAddress('') }}
                        className="text-slate-300 px-3 py-2 text-xs hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-700">
              <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <MapPin size={14} className="text-emerald-400" /> Delivery Pin
              </p>
              <p className="text-[11px] text-slate-400">Store: {STORE_LOCATION.address}</p>
              <LocationPicker
                value={deliveryPin}
                onChange={setDeliveryPin}
                className="h-[240px] w-full sm:h-[280px] lg:h-[320px] rounded-xl overflow-hidden border border-slate-700"
              />
            </div>

            {/* Contact Phone Number */}
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Phone size={14} className="text-indigo-400" /> Contact Phone Number
              </p>

              {phones.length > 0 && !addingPhone ? (
                <div className="space-y-2">
                  {phones.map(pObj => (
                    <label
                      key={pObj.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-sm cursor-pointer transition ${
                        selectedPhone === pObj.phone ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-700/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="phone"
                        checked={selectedPhone === pObj.phone}
                        onChange={() => setSelectedPhone(pObj.phone)}
                        className="accent-indigo-500"
                      />
                      <span>{pObj.phone}</span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAddingPhone(true)}
                    className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold mt-1 hover:underline"
                  >
                    <Plus size={14} /> Add another phone number
                  </button>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                  <input
                    id="phone"
                    type="tel"
                    placeholder="09123456789"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={savePhone}
                      style={{ backgroundColor: '#8F5A1D' }}
                      className="text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition"
                    >
                      Save Phone
                    </button>
                    {phones.length > 0 && (
                      <button
                        type="button"
                        onClick={() => { setAddingPhone(false); setNewPhone('') }}
                        className="text-slate-300 px-3 py-2 text-xs hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Payment Method */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3 flex items-center gap-2">
              <CreditCard size={18} className="text-indigo-400" /> Payment Method
            </h2>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'COD', label: 'Cash on Delivery' },
                { id: 'GCash', label: 'GCash' },
                { id: 'Maya', label: 'Maya' },
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`py-3 px-3 rounded-xl border text-xs font-bold transition ${
                    paymentMethod === m.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-slate-700 text-slate-300 hover:bg-slate-700/40'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {paymentMethod !== 'COD' && (
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-700 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">{paymentMethod} Quick Scan &amp; Pay</h3>
                    <p className="text-[11px] text-slate-300 mt-0.5">Scan the QR code in your {paymentMethod} app to pay {peso(subtotal)}</p>
                  </div>
                  <QrCode size={26} className="text-indigo-400" />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-28 h-28 bg-white rounded-lg p-2 shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AthaliahCollections_${paymentMethod}_${subtotal}`}
                      alt={`${paymentMethod} QR code`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    <p><strong className="text-white">Account name:</strong> Athaliah Collections</p>
                    <p><strong className="text-white">Account number:</strong> 0917-123-4567</p>
                    <p><strong className="text-white">Amount due:</strong> {peso(subtotal)}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ref" className="block text-xs font-semibold text-slate-300">
                    {paymentMethod} reference number (transaction ID)
                  </label>
                  <input
                    id="ref"
                    type="text"
                    placeholder="e.g. 1092834756"
                    value={paymentReference}
                    onChange={e => setPaymentReference(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4 h-fit">
          <h3 className="font-bold text-sm text-white border-b border-slate-700 pb-3">
            Order Summary ({items.reduce((n, i) => n + (i.quantity || 1), 0)} items)
          </h3>

          <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
            {items.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-slate-300">Your cart is empty.</p>
                <Link to="/store" className="text-xs text-indigo-300 underline">Browse the store</Link>
              </div>
            ) : (
              items.map((item, idx) => (
                <div key={item.id ?? item.product_id ?? idx} className="flex items-center gap-3 text-xs border-b border-slate-700 pb-3">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'}
                    alt={item.name || item.product_name}
                    className="w-12 h-12 object-cover rounded-lg bg-slate-900 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{item.name || item.product_name}</p>
                    <p className="text-slate-300">Qty {item.quantity || 1} × {peso(item.price)}</p>
                  </div>
                  <span className="font-bold text-blue-400 shrink-0">{peso((item.price || 0) * (item.quantity || 1))}</span>
                </div>
              ))
            )}
          </div>

          <div className="space-y-1.5 text-xs border-t border-slate-700 pt-3 text-slate-300">
            <div className="flex justify-between"><span>Subtotal</span><span className="text-white">{peso(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className="text-emerald-400 font-semibold">Free</span></div>
            <div className="flex justify-between"><span>Payment</span><span className="font-semibold text-white">{paymentMethod}</span></div>
          </div>

          <div className="border-t border-slate-700 pt-3 flex justify-between font-bold text-white text-sm">
            <span>Total Due</span>
            <span className="text-blue-400">{peso(subtotal)}</span>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={loading || items.length === 0}
            style={{ backgroundColor: '#8F5A1D' }}
            className="w-full text-white py-3 rounded-xl font-bold text-xs tracking-wider hover:opacity-90 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            {loading ? 'Placing Order...' : `Place Order (${paymentMethod})`}
          </button>
        </div>
      </div>
    </div>
  )
}