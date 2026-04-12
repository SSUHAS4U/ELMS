import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  isCheckingAuth: true,
  error: null,

  // Check valid session via HttpOnly Cookie
  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true, error: null });
      const res = await api.get('/auth/me');
      set({ user: res.data.user, isAuthenticated: true, isCheckingAuth: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
    }
  },

  loginWithPassword: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const res = await api.post('/auth/login', { email, password });
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
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed', error);
    }
  }
}));

export default useAuthStore;
