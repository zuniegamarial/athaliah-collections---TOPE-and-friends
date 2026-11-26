import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, Link, Outlet } from 'react-router-dom'
import { api } from './api'
import { CartProvider } from './context/CartContext'
import FlexCarousel from './components/FlexCarousel'
import SideRays from './components/SideRays'
import GridMotion from './components/GridMotion'

// Customer Storefront Pages (Root /)
import StoreAuth from './pages/StoreAuth'
import StoreLayout from './components/StoreLayout'
import StoreCatalog from './pages/StoreCatalog'
import StoreCart from './pages/StoreCart'
import StoreCheckout from './pages/StoreCheckout'
import StoreSearch from './pages/StoreSearch'
import StoreOrders from './pages/StoreOrders'
import StoreOrderTracking from './pages/StoreOrderTracking'
import StoreProfile from './pages/StoreProfile'
import StoreNotifications from './pages/StoreNotifications'

// Admin Portal Pages (/admin)
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import MFA from './pages/MFA'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Inventory from './pages/Inventory'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import Customers from './pages/Customers'
import Categories from './pages/Categories'
import Settings from './pages/Settings'
import Layout from './components/Layout'

// --- PUBLIC LANDING / SHOWCASE HOMEPAGE COMPONENT ---
const showcaseFallback = [
  { name: 'Classic Leather Footwear', price: '1,499', image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800' },
  { name: 'Signature Amber Perfume', price: '899', image_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800' },
  { name: 'Velvet Queen Bedsheet Set', price: '1,299', image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800' },
]

function PublicHome() {
  const [products, setProducts] = useState([]);
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(err => console.log('Catalog preview fetch error:', err));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setNarrow(mq.matches);
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const items = products.length > 0 ? products : showcaseFallback
  const galleryProducts = (products.length > 0 ? products : showcaseFallback)
    .filter(p => p.image_url || p.image)
  const galleryItems = galleryProducts.map((p, idx) => ({
    src: p.image_url || p.image,
    alt: p.name || `Athaliah piece ${idx + 1}`,
  }))
  const heroSource = products.length > 0 ? products.slice(0, 10) : showcaseFallback
  const heroItems = heroSource.map((p, idx) => ({
    src: p.image_url || p.image,
    alt: p.name || `Athaliah piece ${idx + 1}`,
    title: p.name || 'Athaliah Collections',
    subtitle: p.price ? `₱${Number(p.price).toLocaleString()}` : undefined,
  }))

  return (
    <div className="relative flex min-h-screen flex-col bg-ink-950 font-sans text-ink-100">
      {/* One light source for the whole top of the page: header + hero share it */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[720px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]">
        <SideRays
          rayColor1="#FFC46B"
          rayColor2="#96c8ff"
          origin="top-right"
          speed={2.5}
          intensity={2}
          spread={2}
          density={5}
          followMouse
          blend={0.6}
          sharpness={0.5}
          tilt={0}
          falloff={1.6}
          glow={1}
          saturation={1}
          dust={0}
          mouseInfluence={0.5}
          intro
          lightMode={false}
          opacity={1}
        />
        {/* Keeps headline contrast over the bright shafts */}
        <div className="absolute inset-0 bg-ink-950/25" />
      </div>

      <header className="sticky top-0 z-50 bg-ink-950/25 backdrop-blur-2xl">
        <div className="relative mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-3.5 md:px-10">
          <Link
            to="/"
            className="font-display text-lg tracking-[0.14em] text-ink-50 transition-opacity duration-200 hover:opacity-80 sm:text-xl"
          >
            ATHALIAH <span className="italic text-brass-300">Collections</span>
          </Link>

          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 rounded-full border border-ink-100/10 bg-ink-100/[0.04] p-1 text-[11px] uppercase tracking-[0.18em] text-ink-300 md:flex">
            {[
              ['#showcase', 'The edit'],
              ['#gallery', 'Gallery'],
              ['#house', 'The house'],
              ['#visit', 'Visit'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-full px-4 py-2 transition-[background-color,color,transform] duration-200 ease-out hover:bg-ink-100/10 hover:text-ink-50 active:scale-[0.97]"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              to="/store-auth"
              className="hidden rounded-full px-3.5 py-2 text-[11px] uppercase tracking-[0.18em] text-ink-300 transition-[color,transform] duration-200 ease-out hover:text-ink-50 active:scale-[0.97] sm:block"
            >
              Sign in
            </Link>
            <Link
              to="/store-auth"
              className="whitespace-nowrap rounded-full bg-ink-100/10 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-ink-50 ring-1 ring-inset ring-ink-100/15 transition-[background-color,transform] duration-200 ease-out hover:bg-ink-100/15 active:scale-[0.97] md:px-5 md:py-2.5"
            >
              Enter the shop
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        {/* Hero — full-bleed WebGL stage, no frame */}
        <section className="relative overflow-hidden pt-10 md:pt-16">
          <div className="relative z-10 mx-auto max-w-[1600px] px-5 md:px-10">
            <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-brass-300">
              <span className="inline-block h-px w-10 bg-brass-400/70" /> Est. Legazpi City
            </p>

            <h1 className="mt-5 font-display text-[clamp(2.75rem,6.2vw,5.75rem)] font-light leading-[0.98] tracking-[-0.02em] text-ink-50">
              Well-made shoes,
              <span className="block text-ink-400">quiet accessories.</span>
            </h1>

            <div className="mt-7 flex flex-col gap-6 border-t border-ink-100/10 pt-6 md:mt-8 md:flex-row md:items-center md:justify-between md:gap-10">
              <p className="max-w-lg text-sm leading-7 text-ink-300">
                A small, considered collection of footwear and pieces that finish a look — chosen one pair at a time, sold in Albay.
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href="#showcase"
                  className="inline-flex items-center gap-2 rounded-full bg-ink-100 px-5 py-2.5 text-[10px] uppercase tracking-[0.18em] text-ink-950 transition-[background-color,transform] duration-200 ease-out hover:bg-white active:scale-[0.97]"
                >
                  View the collection <span aria-hidden="true">→</span>
                </a>
                <Link
                  to="/store-auth"
                  className="rounded-full px-5 py-2.5 text-[10px] uppercase tracking-[0.18em] text-ink-300 ring-1 ring-inset ring-ink-100/15 transition-[color,box-shadow,transform] duration-200 ease-out hover:text-ink-50 hover:ring-ink-100/30 active:scale-[0.97]"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>

          {/* Edge-to-edge carousel: drag to browse, page scroll left intact */}
          <div className="relative z-10 mt-8 h-[56svh] min-h-[360px] max-h-[820px] w-full md:mt-14 md:h-[64svh] md:min-h-[430px]">
            <FlexCarousel
              items={heroItems}
              preset="liquid"
              intro="rise"
              cardHeight={narrow ? 0.52 : 0.66}
              gap={16}
              squeeze={0.18}
              radius={0}
              fit="natural"
              captions
              focusOnClick
              captureWheel={false}
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-20 bg-gradient-to-r from-ink-950 to-transparent md:block" />
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-20 bg-gradient-to-l from-ink-950 to-transparent md:block" />
          </div>

          <div className="relative z-10 mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 pb-4 text-[10px] uppercase tracking-[0.26em] text-ink-500 md:px-10">
            <span>The current edit</span>
            <span className="hidden sm:inline">Drag to browse</span>
          </div>
        </section>

        {/* Showcase — bento wall inside a floating panel */}
        <section id="showcase" className="scroll-mt-24 px-5 pb-12 pt-14 md:px-10 md:pb-16 md:pt-20">
          <div className="mx-auto max-w-[1600px]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-brass-300">The current edit</p>
                <h2 className="mt-2 font-display text-3xl font-light tracking-[-0.01em] text-ink-50 sm:text-4xl">
                  Featured showcase
                </h2>
              </div>
              <p className="max-w-xs text-xs leading-6 text-ink-400">
                Everything in store, in one wall. Sign in to shop the full catalog and place an order.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {items.map((item, idx) => {
                const image = item.image_url || item.image
                return (
                  <article
                    key={item.id || idx}
                    className="card-lift group relative aspect-[4/5] overflow-hidden rounded-[18px] bg-ink-900 ring-1 ring-inset ring-ink-100/10"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={item.name}
                        loading="lazy"
                        className="card-media absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-ink-500">
                        Athaliah
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/10 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 p-3.5">
                      <h3 className="font-display text-sm font-normal leading-snug text-ink-50 sm:text-base">
                        {item.name}
                      </h3>
                      <span className="text-[11px] tabular-nums tracking-wide text-brass-200">
                        ₱{Number(item.price || 0).toLocaleString()}
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Gallery — drifting wall of the current stock */}
        <section id="gallery" className="scroll-mt-24 px-5 pb-16 md:px-10 md:pb-24">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-brass-300">On the floor</p>
                <h2 className="mt-2 font-display text-3xl font-light tracking-[-0.01em] text-ink-50 sm:text-4xl">
                  The gallery
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="max-w-xs text-xs leading-6 text-ink-400">
                  Every piece we have in store, moving across the wall.
                </p>
                <Link
                  to="/store-auth"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-ink-300 ring-1 ring-inset ring-ink-100/15 transition-[color,box-shadow,transform] duration-200 ease-out hover:text-ink-50 hover:ring-ink-100/30 active:scale-[0.97]"
                >
                  Browse everything <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <div className="relative h-[440px] overflow-hidden rounded-[28px] md:h-[620px]">
              <GridMotion
                items={galleryItems}
                rows={4}
                aspectRatio={1.33}
                gap={14}
                radius={10}
                angle={-10}
                tilt={0}
                speed={20}
                direction="alternate"
                parallax={0.5}
                spotlight={0.6}
                dim={0.4}
                fade={0.5}
                grayscale={false}
                tileColor="#211A14"
                theme="dark"
              />
            </div>
          </div>
        </section>

        {/* The house */}
        <section id="house" className="scroll-mt-24 px-5 pb-16 md:px-10 md:pb-24">
          <div className="mx-auto grid max-w-[1600px] gap-8 pt-4 md:grid-cols-[1.2fr_1fr] md:gap-16 md:pt-8">
            <h2 className="font-display text-[clamp(1.9rem,3.6vw,3.15rem)] font-light leading-[1.08] tracking-[-0.015em] text-ink-50">
              Simple things,
              <span className="block text-ink-400">kept for years.</span>
            </h2>
            <div className="space-y-7">
              <p className="max-w-md text-sm leading-7 text-ink-300">
                Athaliah Collections is a family-run boutique in Legazpi City. We stock a short list of shoes and accessories we would wear ourselves — good leather, honest prices, no noise.
              </p>
              <dl className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.26em] text-ink-500">Where</dt>
                  <dd className="mt-1.5 text-ink-200">Legazpi City, Albay</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.26em] text-ink-500">Hours</dt>
                  <dd className="mt-1.5 text-ink-200">Daily, 9am – 7pm</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </main>

      <footer id="visit" className="scroll-mt-24 border-t border-ink-100/10 px-5 pb-8 pt-14 md:px-10 md:pb-10 md:pt-20">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr] md:gap-8">
            <div>
              <p className="font-display text-2xl tracking-[0.12em] text-ink-100">
                ATHALIAH <span className="italic text-brass-300">Collections</span>
              </p>
              <p className="mt-4 max-w-xs text-sm leading-7 text-ink-400">
                A family-run boutique in Legazpi City. Good leather, honest prices, no noise.
              </p>
              <Link
                to="/store-auth"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink-100 px-5 py-2.5 text-[10px] uppercase tracking-[0.18em] text-ink-950 transition-[background-color,transform] duration-200 ease-out hover:bg-white active:scale-[0.97]"
              >
                Enter the shop <span aria-hidden="true">→</span>
              </Link>
            </div>

            <nav aria-label="Footer">
              <p className="text-[10px] uppercase tracking-[0.26em] text-ink-500">Browse</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#showcase" className="text-ink-300 transition-colors duration-200 hover:text-ink-50">The edit</a></li>
                <li><a href="#gallery" className="text-ink-300 transition-colors duration-200 hover:text-ink-50">Gallery</a></li>
                <li><a href="#house" className="text-ink-300 transition-colors duration-200 hover:text-ink-50">The house</a></li>
                <li><Link to="/store-auth" className="text-ink-300 transition-colors duration-200 hover:text-ink-50">Sign in</Link></li>
              </ul>
            </nav>

            <div>
              <p className="text-[10px] uppercase tracking-[0.26em] text-ink-500">Visit</p>
              <p className="mt-4 text-sm leading-7 text-ink-300">
                Legazpi City, Albay
                <br />
                Daily, 9am – 7pm
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-ink-100/10 pt-6 text-[11px] text-ink-500 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Athaliah Collections</span>
            <div className="flex items-center gap-5">
              <span>Hand-picked in Albay</span>
              <Link to="/admin" className="uppercase tracking-[0.2em] text-ink-600 transition-colors duration-200 hover:text-ink-400">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// --- ADMIN GUARD: only lets in users with a real admin session ---
function RequireAdmin() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let active = true
    api.me()
      .then(res => active && setStatus(res?.authenticated && res.role === 'admin' && res.mfa_verified ? 'ok' : 'denied'))
      .catch(() => active && setStatus('denied'))
    return () => { active = false }
  }, [])

  if (status === 'checking') {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading...</div>
  }
  return status === 'ok' ? <Outlet /> : <Navigate to="/admin" replace />
}

export default function App() {
  return (
    <CartProvider>
      <Routes>
        {/* --- PUBLIC HOMEPAGE WITH SHOWCASE & HIDDEN ADMIN LINK --- */}
        <Route path="/" element={<PublicHome />} />
        <Route path="/store-auth" element={<StoreAuth />} />

        {/* --- CUSTOMER STOREFRONT ROUTES --- */}
        <Route element={<StoreLayout />}>
          <Route path="/store" element={<StoreCatalog />} />
          <Route path="/store/cart" element={<StoreCart />} />
          <Route path="/store/checkout" element={<StoreCheckout />} />
          <Route path="/store/search" element={<StoreSearch />} />
          <Route path="/store/orders" element={<StoreOrders />} />
          <Route path="/store/orders/:id/track" element={<StoreOrderTracking />} />
          <Route path="/store/profile" element={<StoreProfile />} />
          <Route path="/store/notifications" element={<StoreNotifications />} />
        </Route>

        {/* --- ADMIN MANAGEMENT PORTAL (/admin) --- */}
        <Route path="/admin" element={<Login />} />
        <Route path="/welcome" element={<LandingPage />} />
        <Route path="/mfa" element={<MFA />} />
        
        <Route element={<RequireAdmin />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        </Route>

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CartProvider>
  )
}