import { Bell, Sparkles, Tag } from 'lucide-react';

export default function StoreNotifications() {
  const notifications = [
    {
      id: 1,
      title: "Welcome to Athaliah Collections!",
      message: "Enjoy exploring our exclusive line of perfumes, footwear, and accessories.",
      time: "2m ago",
      icon: Sparkles,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
    },
    {
      id: 2,
      title: "Flash Sale Alert!",
      message: "Get up to 20% off on all signature fragrances today.",
      time: "1h ago",
      icon: Tag,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Bell className="text-blue-400" size={22} /> Notifications
          </h2>
          <p className="text-xs text-slate-400 mt-1">Stay updated with your latest alerts, announcements, and offers.</p>
        </div>
        <span className="bg-blue-600/20 text-blue-400 text-xs px-3 py-1 rounded-xl font-bold">{notifications.length} Unread</span>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map(item => {
          const IconComponent = item.icon;
          return (
            <div 
              key={item.id} 
              className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-start gap-4 hover:border-blue-500/50 transition shadow-sm"
            >
              <div className={`p-3 rounded-xl border ${item.color} flex items-center justify-center shrink-0`}>
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
    </div>
  );
}