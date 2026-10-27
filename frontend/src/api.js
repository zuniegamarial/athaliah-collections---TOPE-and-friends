
const BASE = '';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.data = data;
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  login: (body) => request('/api/login', { method: 'POST', body: JSON.stringify(body) }),
  mfa: (body) => request('/api/mfa', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/api/logout', { method: 'POST' }),
  me: () => request('/api/me'),

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
  updateOrderStatus: (id, status) => request(`/api/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  addTracking: (id, tracking_number) => request(`/api/orders/${id}/tracking`, {
    method: 'POST',
    body: JSON.stringify({ tracking_number }),
  }),
  shippingLabel: (id) => request(`/api/orders/${id}/shipping-label`, { method: 'POST' }),
  refundOrder: (id) => request(`/api/orders/${id}/refund`, { method: 'POST' }),

  customers: () => request('/api/customers'),
  createCustomer: (b) => request('/api/customers', { method: 'POST', body: JSON.stringify(b) }),

  categories: () => request('/api/categories'),
  createCategory: (b) => request('/api/categories', {
    method: 'POST',
    body: JSON.stringify(b),
  }),
  updateCategory: (id, b) => request(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(b),
  }),
  deleteCategory: (id) => request(`/api/categories/${id}`, {
    method: 'DELETE',
  }),

  preferences: () => request('/api/preferences'),
  updatePreferences: (b) => request('/api/preferences', {
    method: 'PUT',
    body: JSON.stringify(b),
  }),
};
