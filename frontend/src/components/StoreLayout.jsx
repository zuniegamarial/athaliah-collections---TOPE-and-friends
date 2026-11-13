import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Search, Bell, ClipboardList, User, Home } from 'lucide-react';

export default function StoreLayout() {
  const { cart = [] } = useCart();
  const safeCart = cart || [];
  const totalCartCount = safeCart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  
  const [firstName, setFirstName] = useState('');
  const location = useLocation();

  useEffect(() => {
    fetch('/api/current_user', { credentials: 'include', headers: { 'X-Portal': 'store' } })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && data.role === 'customer') setFirstName(data.first_name || data.username || '');
        else setFirstName('');
      })
      .catch(() => {});
  }, [location.pathname]);

  const navItems = [
    { to: '/store', icon: Home, label: 'Home' },
    { to: '/store/orders', icon: ClipboardList, label: 'Orders' },
    { to: '/store/notifications', icon: Bell, label: 'Alerts' },
    { to: '/store/cart', icon: ShoppingBag, label: 'Cart', badge: totalCartCount },
    { to: '/store/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col pb-20 md:pb-0">
      {/* Top Header (Hidden on very small mobile screens for maximum viewing area, or condensed) */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur px-4 md:px-6 py-3.5 shadow-md flex items-center justify-between">
        <Link to="/store" className="text-lg md:text-xl font-bold tracking-wider text-white">
          ATHALIAH <span className="font-light text-indigo-400">COLLECTIONS</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/store" className="text-sm font-medium text-slate-300 hover:text-white transition">Home</Link>
          <Link to="/store/orders" className="text-sm font-medium text-slate-300 hover:text-white transition">Orders</Link>
          <Link to="/store/notifications" className="text-sm font-medium text-slate-300 hover:text-white transition">Notifications</Link>
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

      {/* Mobile Bottom Navigation Bar (App-like feel on phone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-4 py-2 flex justify-around items-center shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] mt-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute top-0 right-2 bg-indigo-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}