import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors (like token expiration)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already on public pages
      const publicPaths = ['/login', '/register', '/', '/marketplace'];
      const currentPath = window.location.pathname;
      const isPublicPath = publicPaths.includes(currentPath) || currentPath.startsWith('/product/');
      if (!isPublicPath) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// API Service functions
export const authService = {
  login: async (emailOrPhone, password) => {
    const response = await api.post('/auth/login', { emailOrPhone, password });
    return response.data;
  },
  register: async (name, email, phone, hostel, password) => {
    const response = await api.post('/auth/register', { name, email, phone, hostel, password });
    return response.data;
  },
};

export const productService = {
  getAll: async (category = '', search = '') => {
    const response = await api.get('/products', {
      params: { category, search },
    });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  create: async (formData) => {
    // Multipart form data is used for image upload
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  update: async (id, formData) => {
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/products/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },
};

export const wishlistService = {
  getAll: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },
  add: async (productId) => {
    const response = await api.post(`/wishlist/${productId}`);
    return response.data;
  },
  remove: async (productId) => {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  },
  check: async (productId) => {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data;
  },
};

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  getListings: async () => {
    const response = await api.get('/users/me/listings');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/users/me', profileData);
    return response.data;
  },
};

export default api;
