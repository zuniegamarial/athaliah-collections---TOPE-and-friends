import { useState, useEffect } from 'react';
import { Bell, Package, Truck, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';

export default function StoreNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/store/notifications', { credentials: 'include', headers: { 'X-Portal': 'store' } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
          // Mark all current notifications as read by saving the total count
          localStorage.setItem('athaliah_last_read_count', data.length.toString());
        }
      })
      .catch(err => console.error("Error loading notifications:", err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Shipped': return { icon: Truck, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
      case 'Delivered': return { icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'Cancelled': return { icon: XCircle, color: 'text-red-400 bg-red-500/10 border-red-500/20' };
      case 'Processing': return { icon: Package, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      default: return { icon: Clock, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 relative">
      {/* Header Banner */}
      <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Bell className="text-blue-400" size={22} /> Notifications
          </h2>
          <p className="text-xs text-slate-400 mt-1">Stay updated with your latest order status changes and alerts.</p>
        </div>
        <span className="bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-xl font-bold">
          {notifications.length} Total Alerts
        </span>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center space-y-2">
          <Bell className="mx-auto text-slate-600" size={36} />
          <p className="text-sm font-semibold text-white">No notifications yet</p>
          <p className="text-xs text-slate-400">Place an order to start receiving real-time status updates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(item => {
            const { icon: IconComponent, color } = getStatusIcon(item.status);
            return (
              <div 
                key={item.id} 
                className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-start gap-4 hover:border-blue-500/50 transition shadow-sm"
              >
                <div className={`p-3 rounded-xl border ${color} flex items-center justify-center shrink-0`}>
                  <IconComponent size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{item.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}