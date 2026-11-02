import axios from 'axios';

const BASE_URL = 'http://192.168.8.199:5000/api';
export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

export const getProducts = () => apiClient.get('/products');
export const placeOrder = (orderData) => apiClient.post('/orders', orderData);
export const loginUser = (credentials) => apiClient.post('/login', credentials);
export const registerUser = (userData) => apiClient.post('/register', userData);