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
      {/* Announcement line */}
      <div className="bg-brass-600 px-4 py-2 text-center text-[10px] uppercase tracking-[0.22em] text-white">
        Complimentary delivery in Legazpi City over ₱2,000
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur px-4 md:px-8 py-4 flex items-center justify-between">
        <Link to="/store" className="font-display text-lg md:text-xl tracking-[0.12em] text-slate-50">
          ATHALIAH <span className="font-light italic text-brass-300">Collections</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-7 text-[11px] uppercase tracking-[0.18em]">
          <Link to="/store" className="text-slate-300 hover:text-brass-300 transition">Shop</Link>
          <Link to="/store/orders" className="text-slate-300 hover:text-brass-300 transition">Orders</Link>

          <Link to="/store/notifications" className="relative text-slate-300 hover:text-brass-300 transition flex items-center gap-1.5">
            <Bell size={14} />
            Alerts
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-brass-400 text-slate-950 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link to="/store/cart" className="relative text-slate-300 hover:text-brass-300 transition">
            Cart {totalCartCount > 0 && <span className="absolute -top-2 -right-3 bg-brass-400 text-slate-950 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{totalCartCount}</span>}
          </Link>
          <Link to="/store/profile" className="text-slate-300 hover:text-brass-300 transition">Profile</Link>
          {firstName ? (
            <span className="border-l border-slate-800 pl-5 text-slate-100 normal-case tracking-normal">{firstName}</span>
          ) : (
            <Link to="/store-auth" className="border-l border-slate-800 pl-5 text-brass-300 hover:text-brass-200 normal-case tracking-normal">Sign in</Link>
          )}
        </div>

        {/* Mobile Greeting Badge */}
        <Link
          to={firstName ? '/store/profile' : '/store-auth'}
          className="md:hidden flex items-center gap-2 border border-slate-700 px-3 py-1.5 text-[11px] uppercase tracking-wider text-brass-300"
        >
          <User size={14} /> {firstName || 'Sign in'}
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="hidden md:block border-t border-slate-800 px-8 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span className="font-display tracking-[0.12em] text-slate-300">ATHALIAH COLLECTIONS</span>
          <span>Legazpi City, Albay · Open daily, 9am – 7pm</span>
          <Link to="/" className="hover:text-brass-300 transition">Back to the house</Link>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-4 py-2 flex justify-around items-center">
<Link to="/store" className={`relative flex flex-col items-center py-1 px-3 transition ${location.pathname === '/store' ? 'text-brass-300' : 'text-slate-400 hover:text-slate-200'}`}>
          <Home size={20} />
          <span className="text-[10px] mt-1">Shop</span>
        </Link>

        <Link to="/store/orders" className={`relative flex flex-col items-center py-1 px-3 transition ${location.pathname === '/store/orders' ? 'text-brass-300' : 'text-slate-400 hover:text-slate-200'}`}>
          <ClipboardList size={20} />
          <span className="text-[10px] mt-1">Orders</span>
        </Link>

        <Link to="/store/notifications" className={`relative flex flex-col items-center py-1 px-3 transition ${location.pathname === '/store/notifications' ? 'text-brass-300' : 'text-slate-400 hover:text-slate-200'}`}>
          <Bell size={20} />
          <span className="text-[10px] mt-1">Alerts</span>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-2 bg-brass-400 text-slate-950 text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>

        <Link to="/store/cart" className={`relative flex flex-col items-center py-1 px-3 transition ${location.pathname === '/store/cart' ? 'text-brass-300' : 'text-slate-400 hover:text-slate-200'}`}>
          <ShoppingBag size={20} />
          <span className="text-[10px] mt-1">Cart</span>
          {totalCartCount > 0 && (
            <span className="absolute top-0 right-2 bg-brass-400 text-slate-950 text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              {totalCartCount}
            </span>
          )}
        </Link>

        <Link to="/store/profile" className={`relative flex flex-col items-center py-1 px-3 transition ${location.pathname === '/store/profile' ? 'text-brass-300' : 'text-slate-400 hover:text-slate-200'}`}>
          <User size={20} />
          <span className="text-[10px] mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
}