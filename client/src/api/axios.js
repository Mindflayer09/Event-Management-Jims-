import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Attach JWT + Club ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const selectedClub = localStorage.getItem('selectedClub');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only attach if it exists
    if (selectedClub && selectedClub !== 'undefined' && selectedClub !== 'null') {
      config.headers['x-club-id'] = selectedClub;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle auth errors globally
api.interceptors.response.use(
  (response) => response.data, // IMPORTANT
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedClub');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error.response?.data || { message: 'Network error' });
  }
);

export default api;
//Old Code 
/*
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const selectedClub = localStorage.getItem('selectedClub');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (selectedClub) {
      config.headers['x-club-id'] = selectedClub;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || { message: 'Network error' });
  }
);

export default api;
*/