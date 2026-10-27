
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  FolderTree,
  Settings,
  LogOut,
} from 'lucide-react'
import { api } from '../api'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/categories', label: 'Categories', icon: FolderTree },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  const [backgroundColor, setBackgroundColor] = useState('#f7f5f0')
  const [accentColor, setAccentColor] = useState('#a18b69')

  useEffect(() => {
    let active = true

    async function loadPreferences() {
      try {
        const preferences = await api.preferences()

        if (active) {
          setBackgroundColor(preferences.background_color || '#f7f5f0')
          setAccentColor(preferences.accent_color || '#a18b69')
        }
      } catch (error) {
        console.error('Unable to load theme preferences:', error)
      }
    }

    loadPreferences()

    return () => {
      active = false
    }
  }, [location.pathname])

  useEffect(() => {
    document.documentElement.style.setProperty('--app-background', backgroundColor)
    document.documentElement.style.setProperty('--app-accent', accentColor)
  }, [backgroundColor, accentColor])

  const logout = async () => {
    try {
      await api.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }

    navigate('/login')
  }

  return (
    <div
      className="flex min-h-screen text-[#292725]"
      style={{ backgroundColor }}
    >
      {/* Sidebar */}
      <aside
        className="flex w-64 flex-col border-r"
        style={{
          backgroundColor: `${accentColor}20`,
          borderColor: accentColor,
        }}
      >
        <header
          className="border-b px-5 py-6"
          style={{ borderColor: accentColor }}
        >
          <h1 className="text-lg font-semibold tracking-[0.08em]">
            ATHALIAH
          </h1>

          <p className="text-xs font-light tracking-[0.16em]">
            COLLECTIONS
          </p>

          <p className="mt-3 text-xs" style={{ color: accentColor }}>
            ADMIN PORTAL
          </p>
        </header>

        {/* Navigation */}
        <nav aria-label="Main navigation" className="flex-1 p-3">
          <p
            className="mb-3 px-3 pt-3 text-[10px] font-semibold tracking-[0.2em]"
            style={{ color: accentColor }}
          >
            MAIN MENU
          </p>

          <ul className="space-y-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded px-3 py-3 text-sm transition ${
                      isActive
                        ? 'font-medium text-white'
                        : 'text-[#6F5C4B] hover:bg-white/50'
                    }`
                  }
                  style={({ isActive }) =>
                    isActive ? { backgroundColor: accentColor } : {}
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div
          className="border-t p-3"
          style={{ borderColor: accentColor }}
        >
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded px-3 py-3 text-sm transition hover:bg-white/50"
            style={{ color: accentColor }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Top Header */}
        <header
          className="flex items-center justify-between border-b px-6 py-4 transition-colors duration-300"
          style={{
            backgroundColor: `${accentColor}20`,
            borderColor: accentColor,
          }}
        >
          <div>
            <h2 className="text-base font-semibold tracking-wide">
              Athaliah Collections
            </h2>

            <p className="mt-1 text-xs" style={{ color: accentColor }}>
              Store Management System
            </p>
          </div>

          <span className="text-xs tracking-wide" style={{ color: accentColor }}>
            Legazpi City, Albay
          </span>
        </header>

        {/* Page Content */}
        <main
          className="flex-1 p-6 transition-colors duration-300"
          style={{ backgroundColor }}
        >
          <Outlet />
        </main>

      </div>
    </div>
  )
}
