import { Bell } from 'lucide-react';

export default function StoreNotifications() {
  const notifications = [
    { id: '1', title: 'Welcome to Athaliah Collections!', desc: 'Enjoy exploring our exclusive line of perfumes, footwear, and accessories.', time: '2m ago' },
    { id: '2', title: 'Flash Sale Alert!', desc: 'Get up to 20% off on all signature fragrances today.', time: '1h ago' }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h1>
      <div className="space-y-4">
        {notifications.map(item => (
          <div key={item.id} className="bg-white rounded-xl p-5 border border-[#e5e0d8] shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#f3eef7] text-[#a18b69] flex items-center justify-center shrink-0">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-sm text-gray-800">{item.title}</h3>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
              <p className="text-xs text-gray-600">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}