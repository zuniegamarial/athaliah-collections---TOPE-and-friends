import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Bell, ClipboardList, User, Home } from 'lucide-react';

export default function StoreLayout() {
  const { cart = [] } = useCart();
  const safeCart = cart || [];
  const totalCartCount = safeCart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  
  const [firstName, setFirstName] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    fetch('/api/current_user', { credentials: 'include', headers: { 'X-Portal': 'store' } })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && data.role === 'customer') setFirstName(data.first_name || data.username || '');
        else setFirstName('');
      })
      .catch(() => {});

    fetch('/api/store/notifications', { credentials: 'include', headers: { 'X-Portal': 'store' } })
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (Array.isArray(data)) {
          // Check if user already viewed notifications
          const lastReadCount = Number(localStorage.getItem('athaliah_last_read_count') || 0);
          const currentUnread = Math.max(0, data.length - lastReadCount);
          setUnreadCount(currentUnread);
        }
      })
      .catch(() => {});
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col pb-20 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur px-4 md:px-6 py-3.5 shadow-md flex items-center justify-between">
        <Link to="/store" className="text-lg md:text-xl font-bold tracking-wider text-white">
          ATHALIAH <span className="font-light text-indigo-400">COLLECTIONS</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/store" className="text-sm font-medium text-slate-300 hover:text-white transition">Home</Link>
          <Link to="/store/orders" className="text-sm font-medium text-slate-300 hover:text-white transition">Orders</Link>
          
          <Link to="/store/notifications" className="relative text-sm font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5">
            <Bell size={16} />
            Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-md animate-pulse">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link to="/store/cart" className="relative text-sm font-medium text-slate-300 hover:text-white transition">
            Cart {totalCartCount > 0 && <span className="absolute -top-2 -right-3 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{totalCartCount}</span>}
          </Link>
          <Link to="/store/profile" className="text-sm font-medium text-slate-300 hover:text-white transition">Profile</Link>
          {firstName ? (
            <span className="border-l border-slate-800 pl-4 text-sm font-bold text-indigo-400">{firstName}</span>
          ) : (
            <Link to="/store-auth" className="border-l border-slate-800 pl-4 text-sm font-bold text-indigo-400 hover:text-indigo-300">Sign in</Link>
          )}
        </div>

        {/* Mobile Greeting Badge */}
        <Link
          to={firstName ? '/store/profile' : '/store-auth'}
          className="md:hidden flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-400"
        >
          <User size={14} /> {firstName || 'Sign in'}
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-4 py-2 flex justify-around items-center shadow-lg">
        <Link to="/store" className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition ${location.pathname === '/store' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
          <Home size={20} />
          <span className="text-[10px] mt-1">Home</span>
        </Link>

        <Link to="/store/orders" className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition ${location.pathname === '/store/orders' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
          <ClipboardList size={20} />
          <span className="text-[10px] mt-1">Orders</span>
        </Link>

        <Link to="/store/notifications" className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition ${location.pathname === '/store/notifications' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
          <Bell size={20} />
          <span className="text-[10px] mt-1">Alerts</span>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-2 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
              {unreadCount}
            </span>
          )}
        </Link>

        <Link to="/store/cart" className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition ${location.pathname === '/store/cart' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
          <ShoppingBag size={20} />
          <span className="text-[10px] mt-1">Cart</span>
          {totalCartCount > 0 && (
            <span className="absolute top-0 right-2 bg-indigo-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              {totalCartCount}
            </span>
          )}
        </Link>

        <Link to="/store/profile" className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition ${location.pathname === '/store/profile' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
          <User size={20} />
          <span className="text-[10px] mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
}