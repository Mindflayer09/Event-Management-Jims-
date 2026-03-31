import axios from 'axios';

// Safely handle the base URL to prevent "double slash" 404 errors
const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
const cleanApiUrl = rawApiUrl.replace(/\/$/, '');

const api = axios.create({
  baseURL: cleanApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // ✅ Updated to use Organization/Team terminology
    const selectedTeam = localStorage.getItem('selectedTeam'); 

    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (selectedTeam && selectedTeam !== 'null' && selectedTeam !== 'undefined') {
      // ✅ Updated header to match the new architecture
      config.headers['x-team-id'] = selectedTeam; 
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================
api.interceptors.response.use(
  (response) => response.data, 
  (error) => {
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // ✅ Ensure the team selection is cleared on logout
      localStorage.removeItem('selectedTeam'); 

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const errorMessage = error.response?.data?.message || error.message || 'Network connection error';
    
    const responseData = error.response?.data;
    const safeData = (typeof responseData === 'object' && responseData !== null) ? responseData : {};

    return Promise.reject({
      ...safeData,
      message: errorMessage
    });
  }
);

export default api;