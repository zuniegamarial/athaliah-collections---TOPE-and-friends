import { Routes, Route, Navigate } from 'react-router-dom'
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

export default function App() {
  return (
    <CartProvider>
      <Routes>
        {/* --- CUSTOMER STOREFRONT (Opens at root / for both Localhost and Network IP) --- */}
        <Route path="/" element={<StoreAuth />} />
        
        <Route element={<StoreLayout />}>
          <Route path="/store" element={<StoreCatalog />} />
          <Route path="/store/cart" element={<StoreCart />} />
          <Route path="/store/checkout" element={<StoreCheckout />} />
          <Route path="/store/search" element={<StoreSearch />} />
          <Route path="/store/orders" element={<StoreOrders />} />
          <Route path="/store/profile" element={<StoreProfile />} />
          <Route path="/store/notifications" element={<StoreNotifications />} />
        </Route>

        {/* --- ADMIN MANAGEMENT PORTAL (Accessed via /admin) --- */}
        <Route path="/admin" element={<Login />} />
        <Route path="/welcome" element={<LandingPage />} />
        <Route path="/mfa" element={<MFA />} />
        
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

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CartProvider>
  )
}