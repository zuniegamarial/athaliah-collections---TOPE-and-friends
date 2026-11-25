import { useEffect, useState } from 'react'
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
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

// Blend two hex colors (amount = how much of `other` to mix in)
function mix(hex, other, amount) {
  const parse = (h) => {
    const m = /^#?([0-9a-f]{6})$/i.exec((h || '').trim())
    if (!m) return null
    const n = parseInt(m[1], 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const a = parse(hex)
  const b = parse(other)
  if (!a || !b) return hex
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * amount))
  return `#${c.map(v => v.toString(16).padStart(2, '0')).join('')}`
}

// Pick readable text colors for whatever background the admin chose in Settings
function isDarkColor(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || '').trim())
  if (!m) return false
  const n = parseInt(m[1], 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  const [backgroundColor, setBackgroundColor] = useState('#F7F3EC')
  const [accentColor, setAccentColor] = useState('#8A5A1C')

  useEffect(() => {
    let active = true

    async function loadPreferences() {
      try {
        const preferences = await api.preferences()

        if (active) {
          setBackgroundColor(preferences.background_color || '#F7F3EC')
          setAccentColor(preferences.accent_color || '#8A5A1C')
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

  const dark = isDarkColor(backgroundColor)
  const textColor = dark ? '#F3ECE0' : '#211A14'
  const mutedColor = dark ? '#D2C2AA' : '#6E5C48'

  useEffect(() => {
    const root = document.documentElement.style
    root.setProperty('--app-background', backgroundColor)
    root.setProperty('--app-accent', accentColor)
    root.setProperty('--app-text', textColor)
    root.setProperty('--app-muted', mutedColor)

    // Cards / tables / inputs follow the theme (dark panels on a dark background)
    root.setProperty('--panel-bg', dark ? mix(backgroundColor, '#ffffff', 0.07) : '#ffffff')
    root.setProperty('--panel-head', dark ? mix(backgroundColor, '#ffffff', 0.035) : `${accentColor}14`)
    root.setProperty('--panel-head-text', dark ? '#D2C2AA' : accentColor)
    root.setProperty('--panel-border', dark ? mix(backgroundColor, '#ffffff', 0.16) : `${accentColor}40`)
    root.setProperty('--panel-text', dark ? '#F3ECE0' : '#211A14')
    root.setProperty('--panel-muted', dark ? '#B3A087' : '#6E5C48')
    root.setProperty('--input-bg', dark ? mix(backgroundColor, '#000000', 0.25) : '#ffffff')
  }, [backgroundColor, accentColor, textColor, mutedColor, dark])

  const logout = async () => {
    try {
      await api.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }

    navigate('/admin')
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      data-app-dark={dark ? 'true' : 'false'}
      style={{ backgroundColor, color: textColor }}
    >
      {/* FIXED SIDEBAR */}
      <aside className="flex h-screen w-64 flex-col border-r sticky top-0 shrink-0 bg-[#211A14] text-slate-100">
        <header className="border-b border-white/10 px-5 py-6">
          <h1 className="font-display text-xl tracking-[0.1em] text-slate-50">
            ATHALIAH
          </h1>

          <p className="font-display text-xs italic tracking-[0.08em] text-brass-300">
            Collections
          </p>

          <p className="mt-4 text-[10px] uppercase tracking-[0.24em] text-brass-400">
            Admin portal
          </p>
        </header>

        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto p-3">
          <p className="mb-3 px-3 pt-3 text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Main menu
          </p>

          <ul className="space-y-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 text-[13px] transition ${
                      isActive
                        ? 'bg-brass-400 text-slate-950'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-[13px] text-slate-400 transition hover:bg-white/5 hover:text-brass-300"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* RIGHT CONTAINER: Top bar + Scrollable Content Area */}
      <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
        {/* FIXED TOP HEADER */}
        <header
          className="flex items-center justify-between border-b px-6 py-4 sticky top-0 z-10 shrink-0 transition-colors duration-300"
          style={{ borderColor: `${accentColor}40` }}
        >
          <div>
            <h2 className="font-display text-base tracking-wide">
              Athaliah Collections
            </h2>

            <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em]" style={{ color: accentColor }}>
              Store management
            </p>
          </div>

          <div className="flex items-center gap-5">
            <span className="hidden text-xs sm:block" style={{ color: mutedColor }}>
              Legazpi City, Albay
            </span>
            <Link
              to="/store"
              className="border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition hover:opacity-80"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Storefront
            </Link>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <main
          className="flex-1 overflow-y-auto p-6 transition-colors duration-300"
          style={{ backgroundColor, color: textColor }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}