import { Outlet, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Search, Bell, ClipboardList, User, Home } from 'lucide-react';

export default function StoreLayout() {
  // Fixed: Destructure 'cart' instead of 'cartItems' and provide a safe fallback array
  const { cart = [] } = useCart();
  const safeCart = cart || [];
  
  const totalCartCount = safeCart.reduce((sum, item) => {
    const itemQty = Number(item.quantity || 1);
    return sum + itemQty;
  }, 0);

  // Retrieve logged-in user info (stored during login)
  const username = localStorage.getItem('username') || 'Valued Customer';

  return (
    <div className="min-h-screen bg-[#f9f6f0] text-gray-800 flex flex-col">
      {/* Top Customer Header */}
      <header className="sticky top-0 z-30 border-b border-[#e5e0d8] bg-white px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/store" className="text-xl font-bold tracking-wider text-gray-900">
            Athaliah <span className="font-light">Collections</span>
          </Link>

          {/* Navigation Links / Icons */}
          <div className="flex items-center gap-6">
            <Link to="/store" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#a18b69] transition">
              <Home size={18} /> Home
            </Link>
            <Link to="/store/search" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#a18b69] transition">
              <Search size={18} /> Search
            </Link>
            <Link to="/store/orders" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#a18b69] transition">
              <ClipboardList size={18} /> Orders
            </Link>
            <Link to="/store/notifications" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#a18b69] transition">
              <Bell size={18} /> Notifications
            </Link>
            <Link to="/store/cart" className="relative flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#a18b69] transition">
              <ShoppingBag size={18} /> Cart
              {totalCartCount > 0 && (
                <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#a18b69] text-xs text-white font-bold">
                  {totalCartCount}
                </span>
              )}
            </Link>
            <Link to="/store/profile" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#a18b69] transition">
              <User size={18} /> Profile
            </Link>

            {/* User's Name / Username */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-6 text-sm font-bold text-[#a18b69]">
              <User size={16} />
              <span>{username}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Content Renders Here */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}