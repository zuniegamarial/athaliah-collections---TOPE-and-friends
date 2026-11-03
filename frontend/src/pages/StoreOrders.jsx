import { useState, useEffect } from 'react';
import { ClipboardList, AlertCircle } from 'lucide-react';

export default function StoreOrders() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    // FIX: Changed from /api/orders to /api/store/orders so it only fetches the logged-in user's orders
    fetch('http://192.168.8.199:5000/api/store/orders', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      })
      .catch(err => console.log("Fetch orders error:", err));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`http://192.168.8.199:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "Cancelled" }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        alert("Order cancelled successfully.");
        fetchOrders();
      } else {
        alert(data.error || "Failed to cancel order.");
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      alert("Could not cancel order. Please check connection.");
    }
  };

  const filteredOrders = orders.filter(item => {
    const status = item.order_status || 'Pending';
    const isCancelled = status === 'Refunded' || status === 'Returns' || status === 'Cancelled';
    if (activeTab === 'Cancelled') return isCancelled;
    if (activeTab === 'Pending') return status.toLowerCase() === 'pending';
    return status.toLowerCase() === activeTab.toLowerCase();
  });

  const tabs = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

      {/* Tabs */}
      <div className="flex bg-[#e1e4e8] p-1 rounded-xl mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
              activeTab === tab ? 'bg-white text-[#a18b69] shadow-sm' : 'text-gray-600 hover:text-black'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-[#e5e0d8]">
            <ClipboardList className="mx-auto text-gray-300 mb-2" size={48} />
            <p className="text-gray-500 text-sm">No {activeTab.toLowerCase()} orders found.</p>
          </div>
        ) : (
          filteredOrders.map(item => {
            const status = item.order_status || 'Pending';
            const isPending = status.toLowerCase() === 'pending';

            return (
              <div key={item.id} className="bg-white rounded-xl p-5 border border-[#e5e0d8] shadow-sm">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
                  <span className="font-bold text-sm text-gray-800">{item.order_number || `ATH-${item.id}`}</span>
                  <span className="text-xs font-bold text-[#a18b69] uppercase tracking-wider">{status}</span>
                </div>

                <div className="flex items-center gap-4">
                  <img 
                    src={item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'} 
                    alt="Product" 
                    className="w-16 h-16 object-cover rounded-lg bg-gray-100" 
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">{item.product_name || item.items || 'Athaliah Collection Item'}</h3>
                    <p className="text-xs font-bold text-green-600 mt-1">Total: ₱{item.total}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Ordered on: {item.order_date || 'Oct 29, 2026'}</p>
                  </div>
                  {isPending && (
                    <button 
                      type="button"
                      onClick={() => handleCancelOrder(item.id)}
                      className="border border-gray-800 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-800 hover:text-white transition"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}