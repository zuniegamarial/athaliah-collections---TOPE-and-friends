import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Boxes, ShoppingCart, Users,
  FolderTree, Settings, LogOut
} from 'lucide-react'
import { api } from '../api'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/categories', label: 'Categories', icon: FolderTree, disabled: true },
  { to: '/settings', label: 'Settings', icon: Settings, disabled: true },
]

export default function Layout() {
  const nav2 = useNavigate()
  const logout = async () => {
    try { await api.logout() } catch {}
    nav2('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <header className="p-5 border-b border-gray-200">
          <h1 className="text-lg font-bold text-brand-700">Athaliah Collections</h1>
          <p className="text-xs text-gray-500">Admin Portal</p>
        </header>
        <nav aria-label="Main navigation" className="flex-1 p-3">
          <ul className="space-y-1">
            {nav.map(({ to, label, icon: Icon, disabled }) => (
              <li key={to}>
                {disabled ? (
                  <span
                    className="flex items-center gap-3 px-3 py-2 rounded text-gray-400 cursor-not-allowed"
                    aria-disabled="true"
                  >
                    <Icon size={18} aria-hidden="true" /> {label}
                  </span>
                ) : (
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded transition ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <Icon size={18} aria-hidden="true" /> {label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-gray-700 hover:bg-gray-100"
          >
            <LogOut size={18} aria-hidden="true" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            Athaliah Collections — Admin Dashboard
          </h2>
          <span className="text-sm text-gray-500">Legazpi City, Albay</span>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}