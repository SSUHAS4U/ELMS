import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Crucial for receiving HttpOnly cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to handle unauthenticated responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if we are just checking auth status on load
      const isAuthCheck = error.config.url.includes('/auth/me');
      const isLoginRoute = error.config.url.includes('/auth/login');
      
      if (!isAuthCheck && !isLoginRoute && window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
