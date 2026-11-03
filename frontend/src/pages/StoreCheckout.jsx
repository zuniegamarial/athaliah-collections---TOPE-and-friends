import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, MapPin, Phone, CreditCard, Plus, QrCode, Loader2 } from 'lucide-react';

export default function StoreCheckout() {
  const { cart = [], clearCart } = useCart();
  const navigate = useNavigate();
  
  const safeCart = cart || [];
  
  const subtotal = safeCart.reduce((acc, item) => {
    const itemPrice = Number(item.price || item.unit_price || item.amount || item.retail_price || item.srp || item.cost || 0);
    const itemQty = Number(item.quantity || 1);
    return acc + (itemPrice * itemQty);
  }, 0);

  const currentUser = localStorage.getItem('username') || 'guest';
  const addressKey = `athaliah_addresses_${currentUser}`;
  const phoneKey = `athaliah_phones_${currentUser}`;

  const [savedAddresses, setSavedAddresses] = useState(() => {
    const saved = localStorage.getItem(addressKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedAddress, setSelectedAddress] = useState(savedAddresses[0] || '');
  const [isAddingAddress, setIsAddingAddress] = useState(savedAddresses.length === 0);
  const [newAddressInput, setNewAddressInput] = useState('');

  const [savedPhones, setSavedPhones] = useState(() => {
    const saved = localStorage.getItem(phoneKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPhone, setSelectedPhone] = useState(savedPhones[0] || '');
  const [isAddingPhone, setIsAddingPhone] = useState(savedPhones.length === 0);
  const [newPhoneInput, setNewPhoneInput] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [paymentReference, setPaymentReference] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    localStorage.setItem(addressKey, JSON.stringify(savedAddresses));
  }, [savedAddresses, addressKey]);

  useEffect(() => {
    localStorage.setItem(phoneKey, JSON.stringify(savedPhones));
  }, [savedPhones, phoneKey]);

  const handleSaveAddress = () => {
    if (!newAddressInput.trim()) return;
    const updated = [...savedAddresses, newAddressInput.trim()];
    setSavedAddresses(updated);
    setSelectedAddress(newAddressInput.trim());
    setNewAddressInput('');
    setIsAddingAddress(false);
  };

  const handleSavePhone = () => {
    if (!newPhoneInput.trim()) return;
    const updated = [...savedPhones, newPhoneInput.trim()];
    setSavedPhones(updated);
    setSelectedPhone(newPhoneInput.trim());
    setNewPhoneInput('');
    setIsAddingPhone(false);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedAddress) {
      alert("Please select or add a shipping address.");
      return;
    }
    if (!selectedPhone) {
      alert("Please select or add a contact phone number.");
      return;
    }
    if ((paymentMethod === 'GCash' || paymentMethod === 'Maya') && !paymentReference.trim()) {
      alert(`Please enter your ${paymentMethod} Reference Number / Transaction ID.`);
      return;
    }

    setLoading(true);

    const orderPayload = {
      total: subtotal,
      payment_method: paymentMethod,
      payment_reference: paymentReference || 'N/A',
      shipping_address: selectedAddress,
      contact_phone: selectedPhone,
      items: safeCart.map(item => ({
        product_id: item.id || item.product_id,
        product_name: item.name || item.product_name,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || item.unit_price || item.amount || item.retail_price || item.srp || item.cost || 0)
      }))
    };

    try {
      // FIXED: Pointing directly to port 5000 on your network IP to prevent 401 Unauthorized proxy mismatches
      const response = await fetch('http://192.168.8.199:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        clearCart();
      } else {
        setErrorMsg(data.message || "Failed to place order on server.");
      }
    } catch (err) {
      console.error("Checkout connection error:", err);
      setErrorMsg("Network error. Could not connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-[#e5e0d8] shadow-sm p-8 mt-6">
        <CheckCircle2 className="w-16 h-16 text-[#a18b69] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Order Placed Successfully!</h2>
        <p className="text-xs text-gray-500 mt-2 mb-6">
          Thank you for shopping with Athaliah Collections. Your order status is currently <strong className="text-amber-600">Pending</strong> review by the admin.
          <span className="block mt-1">Payment Method: <strong>{paymentMethod}</strong></span>
          {paymentMethod !== 'COD' && <span className="block mt-1">Ref No: {paymentReference}</span>}
        </p>
        <button
          onClick={() => navigate('/store/orders')}
          className="bg-[#a18b69] text-white px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider hover:bg-[#8f795a] transition"
        >
          View My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-4 pb-12">
      <button 
        onClick={() => navigate('/store')}
        className="flex items-center gap-2 text-xs text-[#a18b69] font-medium hover:underline"
      >
        <ArrowLeft size={14} /> Back to Store
      </button>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-[#e5e0d8] shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-3">Shipping Details</h2>
            
            <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-6">
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#a18b69]" /> Shipping Address
                </label>

                {savedAddresses.length > 0 && !isAddingAddress ? (
                  <div className="space-y-2">
                    {savedAddresses.map((addr, idx) => (
                      <label key={idx} className={`flex items-center gap-3 p-3 rounded-xl border text-sm cursor-pointer transition ${selectedAddress === addr ? 'border-[#a18b69] bg-[#f9f6f0]' : 'border-[#e5e0d8]'}`}>
                        <input 
                          type="radio" 
                          name="addressRadio" 
                          checked={selectedAddress === addr} 
                          onChange={() => setSelectedAddress(addr)}
                          className="accent-[#a18b69]"
                        />
                        <span className="text-gray-700">{addr}</span>
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(true)}
                      className="flex items-center gap-1.5 text-xs text-[#a18b69] font-semibold mt-1 hover:underline"
                    >
                      <Plus size={14} /> Add another address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 bg-[#f9f6f0] p-4 rounded-xl border border-[#e5e0d8]">
                    <textarea
                      rows={2}
                      placeholder="Enter complete delivery address (Street, Barangay, City)"
                      value={newAddressInput}
                      onChange={(e) => setNewAddressInput(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#e5e0d8] bg-white text-sm outline-none focus:ring-2 focus:ring-[#a18b69]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveAddress}
                        className="bg-[#a18b69] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-[#8f795a] transition"
                      >
                        Save Address
                      </button>
                      {savedAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsAddingAddress(false)}
                          className="text-gray-500 px-3 py-2 text-xs hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2 border-t">
                <label className="block text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                  <Phone size={14} className="text-[#a18b69]" /> Contact Phone Number
                </label>

                {savedPhones.length > 0 && !isAddingPhone ? (
                  <div className="space-y-2">
                    {savedPhones.map((ph, idx) => (
                      <label key={idx} className={`flex items-center gap-3 p-3 rounded-xl border text-sm cursor-pointer transition ${selectedPhone === ph ? 'border-[#a18b69] bg-[#f9f6f0]' : 'border-[#e5e0d8]'}`}>
                        <input 
                          type="radio" 
                          name="phoneRadio" 
                          checked={selectedPhone === ph} 
                          onChange={() => setSelectedPhone(ph)}
                          className="accent-[#a18b69]"
                        />
                        <span className="text-gray-700">{ph}</span>
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsAddingPhone(true)}
                      className="flex items-center gap-1.5 text-xs text-[#a18b69] font-semibold mt-1 hover:underline"
                    >
                      <Plus size={14} /> Add another number
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 bg-[#f9f6f0] p-4 rounded-xl border border-[#e5e0d8]">
                    <input
                      type="tel"
                      placeholder="09123456789"
                      value={newPhoneInput}
                      onChange={(e) => setNewPhoneInput(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#e5e0d8] bg-white text-sm outline-none focus:ring-2 focus:ring-[#a18b69]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSavePhone}
                        className="bg-[#a18b69] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-[#8f795a] transition"
                      >
                        Save Number
                      </button>
                      {savedPhones.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsAddingPhone(false)}
                          className="text-gray-500 px-3 py-2 text-xs hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-[#e5e0d8] shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
              <CreditCard size={18} className="text-[#a18b69]" /> Payment Method
            </h2>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'COD', label: 'Cash on Delivery' },
                { id: 'GCash', label: 'GCash' },
                { id: 'Maya', label: 'Maya' }
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`py-3 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === method.id 
                      ? 'border-[#a18b69] bg-[#f9f6f0] text-[#a18b69] shadow-sm' 
                      : 'border-[#e5e0d8] text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>

            {(paymentMethod === 'GCash' || paymentMethod === 'Maya') && (
              <div className="mt-4 p-5 rounded-xl bg-[#f9f6f0] border border-[#e5e0d8] space-y-4">
                <div className="flex items-center justify-between border-b border-[#e5e0d8] pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">{paymentMethod} Quick Scan & Pay</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">Scan the QR code using your {paymentMethod} app to pay ₱{subtotal.toLocaleString()}</p>
                  </div>
                  <QrCode size={28} className="text-[#a18b69]" />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-[#e5e0d8]">
                  <div className="w-28 h-28 bg-gray-100 rounded-lg border flex items-center justify-center p-2 text-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AthaliahCollections_${paymentMethod}_${subtotal}`} 
                      alt={`${paymentMethod} QR Code`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-1 text-xs text-gray-700 flex-1">
                    <p><strong className="text-gray-900">Account Name:</strong> Athaliah Collections</p>
                    <p><strong className="text-gray-900">Account Number:</strong> 0917-123-4567</p>
                    <p><strong className="text-gray-900">Amount Due:</strong> ₱{subtotal.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 pt-1">Please transfer the exact amount before placing your order.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Enter {paymentMethod} Reference Number (Transaction ID):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1092834756"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#e5e0d8] bg-white text-sm outline-none focus:ring-2 focus:ring-[#a18b69]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5e0d8] shadow-sm p-6 space-y-4 h-fit">
          <h3 className="font-bold text-sm text-gray-800 border-b pb-3">Order Summary ({safeCart.length} items)</h3>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
            {safeCart.map((item, idx) => {
              const itemPrice = Number(item.price || item.unit_price || item.amount || item.retail_price || item.srp || item.cost || 0);
              const itemQty = Number(item.quantity || 1);
              const itemTotal = itemPrice * itemQty;

              return (
                <div key={idx} className="flex items-center gap-3 text-xs border-b pb-2">
                  <img 
                    src={item.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"} 
                    alt={item.name} 
                    className="w-12 h-12 object-cover rounded-lg bg-gray-100" 
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 line-clamp-1">{item.name || item.product_name}</p>
                    <p className="text-gray-500">Qty: {itemQty} × ₱{itemPrice.toLocaleString()}</p>
                  </div>
                  <span className="font-bold text-[#a18b69]">₱{itemTotal.toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5 text-xs border-t pt-3 text-gray-600">
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="font-semibold text-gray-800">{paymentMethod}</span>
            </div>
          </div>

          <div className="border-t pt-3 flex justify-between font-bold text-gray-900 text-sm">
            <span>Total Due:</span>
            <span className="text-[#a18b69]">₱{subtotal.toLocaleString()}</span>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={loading || safeCart.length === 0}
            className="w-full bg-[#a18b69] text-white py-3 rounded-xl font-bold text-xs tracking-wider hover:bg-[#8f795a] transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            {loading ? 'Placing Order...' : `Place Order (${paymentMethod})`}
          </button>
        </div>
      </div>
    </div>
  );
}