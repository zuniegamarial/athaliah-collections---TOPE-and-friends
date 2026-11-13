import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, Link, Outlet } from 'react-router-dom'
import { api } from './api'
import { CartProvider } from './context/CartContext'

// Customer Storefront Pages (Root /)
import StoreAuth from './pages/StoreAuth'
import StoreLayout from './components/StoreLayout'
import StoreCatalog from './pages/StoreCatalog'
import StoreCart from './pages/StoreCart'
import StoreCheckout from './pages/StoreCheckout'
import StoreSearch from './pages/StoreSearch'
import StoreOrders from './pages/StoreOrders'
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
function PublicHome() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.log('Catalog preview fetch error:', err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar with User Sign In / Sign Up */}
      <header className="w-full py-4 px-8 bg-white/80 backdrop-blur-md shadow-sm flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold tracking-wider text-slate-900">ATHALIAH COLLECTIONS</h1>
        <div className="flex gap-4">
          <Link to="/store-auth" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">
            Sign In
          </Link>
          <Link to="/store-auth" className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg shadow hover:bg-slate-800 transition">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-b from-white to-slate-100">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
          Elegance Defined.
        </h2>
        <p className="max-w-xl text-lg text-slate-600 mb-8">
          Explore our exclusive, hand-picked collection of premium shoes, accessories, perfumes, and luxurious bedsheets in Legazpi City.
        </p>
        <a href="#showcase" className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-full shadow-lg hover:bg-indigo-500 transition">
          Explore Showcase ↓
        </a>
      </section>

      {/* Scrollable Product Showcase (Display only - No Buy/Cart buttons) */}
      <section id="showcase" className="max-w-6xl mx-auto px-6 py-20 w-full">
        <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">Featured Showcase</h3>
        <p className="text-slate-500 text-center mb-10">Preview our finest items. Sign in to shop the full catalog.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.length > 0 ? (
            products.slice(0, 6).map((p, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-center">
                <div className="w-full h-48 bg-slate-100 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
                  {p.image || p.image_url ? (
                    <img 
                      src={p.image || p.image_url} 
                      alt={p.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-slate-400 text-sm font-light">[No Image Available]</span>
                  )}
                </div>
                <h4 className="font-semibold text-lg text-slate-800">{p.name}</h4>
                <p className="text-indigo-600 font-medium mt-1">₱{p.price}</p>
              </div>
            ))
          ) : (
            // Aesthetic mock placeholders with sample images if backend is empty
            [
              { name: 'Classic Leather Footwear', price: '1,499', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500' },
              { name: 'Signature Amber Perfume', price: '899', img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500' },
              { name: 'Velvet Queen Bedsheet Set', price: '1,299', img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-center">
                <div className="w-full h-48 bg-slate-100 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-semibold text-lg text-slate-800">{item.name}</h4>
                <p className="text-indigo-600 font-medium mt-1">₱{item.price}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Discreet Footer with Hidden Admin Access Link */}
      <footer className="w-full py-8 px-6 bg-slate-900 text-slate-400 flex flex-col sm:flex-row justify-between items-center text-sm border-t border-slate-800">
        <p>© 2026 Athaliah Collections. All rights reserved.</p>
        
        {/* Secret / Hidden-in-plain-sight Admin Access Link */}
        <div className="mt-4 sm:mt-0">
          <Link to="/admin" className="text-slate-600 hover:text-slate-400 transition text-xs tracking-widest uppercase font-mono">
            Admin Access
          </Link>
        </div>
      </footer>
    </div>
  );
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