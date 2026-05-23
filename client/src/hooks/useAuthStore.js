import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  isCheckingAuth: true,
  error: null,

  // Check valid session via HttpOnly Cookie / localStorage token
  checkAuth: async () => {
    // Fast path: no local token means definitely not authenticated.
    // Skip the server round-trip so the Landing page renders instantly.
    const token = localStorage.getItem('elms_token');
    if (!token) {
      set({ isCheckingAuth: false, isAuthenticated: false });
      return;
    }

    set({ isCheckingAuth: true, error: null });
    // Use a 10-second timeout so a cold-starting backend never blocks
    // the UI indefinitely. If the server doesn't respond in time,
    // clear the stale token and fall through to the login page.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await api.get('/auth/me', { signal: controller.signal });
      clearTimeout(timer);
      set({ user: res.data.user, isAuthenticated: true, isCheckingAuth: false });
    } catch (error) {
      clearTimeout(timer);
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        // Server timed out — clear stale token so user can re-login
        localStorage.removeItem('elms_token');
      }
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
    }
  },

  loginWithPassword: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.token) {
        localStorage.setItem('elms_token', res.data.token);
      }
      
      set({ user: res.data.user, isAuthenticated: true, loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        loading: false 
      });
      return false;
    }
  },

  sendOtp: async (email) => {
    try {
      set({ loading: true, error: null });
      await api.post('/auth/send-otp', { email });
      set({ loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to send OTP', 
        loading: false 
      });
      return false;
    }
  },

  loginWithOtp: async (email, otp) => {
    try {
      set({ loading: true, error: null });
      const res = await api.post('/auth/verify-otp', { email, otp });
      
      if (res.data.token) {
        localStorage.setItem('elms_token', res.data.token);
      }
      
      set({ user: res.data.user, isAuthenticated: true, loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Invalid OTP', 
        loading: false 
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      localStorage.removeItem('elms_token');
      set({ user: null, isAuthenticated: false });
    }
  }
}));

export default useAuthStore;
