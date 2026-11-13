const BASE = ''; // same-origin: Vite proxies /api to Flask (see vite.config.js)

// Admin and customer logins are separate; tell the server which one is asking.
const portal = () => {
  const p = window.location.pathname;
  return p === '/' || p.startsWith('/store') ? 'store' : 'admin';
};

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-Portal': portal(), ...(options.headers || {}) },
  });

  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: 'Invalid server response' }; }

  if (!res.ok) {
    const err = new Error(data.message || data.error || 'Request failed');
    err.data = data;
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  login: (body) => request('/api/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => {
    // only forget the sign-in; keep carts and saved data on this device
    ['athaliah_active_user', 'athaliah_role', 'athaliah_logged_in', 'role', 'username',
     'isAuthenticated', 'isAdmin', 'pending_mfa_user'].forEach(k => localStorage.removeItem(k));
    return request('/api/logout', { method: 'POST' });
  },
  mfa: (body) => request('/api/mfa', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/me'),
  currentUser: () => request('/api/current_user'),

  dashboard: () => request('/api/dashboard'),

  products: (q = '') => request('/api/products' + (q ? `?q=${encodeURIComponent(q)}` : '')),
  product: (id) => request(`/api/products/${id}`),
  createProduct: (b) => request('/api/products', { method: 'POST', body: JSON.stringify(b) }),
  updateProduct: (id, b) => request(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: 'DELETE' }),

  inventory: () => request('/api/inventory'),
  updateInventory: (id, b) => request(`/api/inventory/${id}`, { method: 'PUT', body: JSON.stringify(b) }),

  orders: () => request('/api/orders'),
  order: (id) => request(`/api/orders/${id}`),
  createOrder: (b) => request('/api/orders', { method: 'POST', body: JSON.stringify(b) }),
  updateOrderStatus: (id, status) => request(`/api/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),

  customers: () => request('/api/customers'),
  createCustomer: (b) => request('/api/customers', { method: 'POST', body: JSON.stringify(b) }),

  storeOrders: () => request('/api/store/orders'),
  cancelStoreOrder: (id) => request(`/api/store/orders/${id}/cancel`, { method: 'POST' }),
  profile: () => request('/api/profile'),
  updateProfile: (b) => request('/api/profile', { method: 'PUT', body: JSON.stringify(b) }),
  addAddress: (address) => request('/api/profile/addresses', { method: 'POST', body: JSON.stringify({ address }) }),
  deleteAddress: (id) => request(`/api/profile/addresses/${id}`, { method: 'DELETE' }),
  categories: () => request('/api/categories'),
  preferences: () => request('/api/preferences'),
  updatePreferences: (b) => request('/api/preferences', {
    method: 'PUT',
    body: JSON.stringify(b),
  }),
};