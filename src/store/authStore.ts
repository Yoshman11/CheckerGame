import { create } from 'zustand';
import axios from 'axios';
import { AuthState, LoginCredentials, RegisterCredentials } from '../types/auth';

const API_URL = '/api';

interface AuthStore extends AuthState {
  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,

  initialize: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const { data: user } = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        set({ user, session: { token }, loading: false });
      } else {
        set({ user: null, session: null, loading: false });
      }
    } catch (error) {
      console.error('Initialization error:', error);
      localStorage.removeItem('token');
      set({ user: null, session: null, loading: false });
    }
  },

  login: async ({ email, password }) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      if (!data.token) {
        throw new Error('No token received');
      }

      localStorage.setItem('token', data.token);
      set({ user: data.user, session: { token: data.token } });
    } catch (error: any) {
      localStorage.removeItem('token');
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      throw new Error(errorMessage);
    }
  },

  register: async ({ email, password, username }) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        username
      });
      
      if (!data.token) {
        throw new Error('No token received');
      }

      localStorage.setItem('token', data.token);
      set({ user: data.user, session: { token: data.token } });
    } catch (error: any) {
      localStorage.removeItem('token');
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    localStorage.removeItem('token');
    set({ user: null, session: null });
  }
}));