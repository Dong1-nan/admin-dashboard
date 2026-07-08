import { create } from 'zustand';
import { User, LoginInput } from '../types';
import { authApi } from '../api/auth';
import { message } from 'antd';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  login: (credentials: LoginInput) => Promise<boolean>;
  logout: () => void;
  fetchUserInfo: () => Promise<void>;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,

  login: async (credentials: LoginInput) => {
    set({ loading: true });
    try {
      const response = await authApi.login(credentials);
      const { token, user } = response.data.data!;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        token,
        user,
        isAuthenticated: true,
        loading: false,
      });
      
      message.success('登录成功');
      return true;
    } catch (error) {
      set({ loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
    message.success('已退出登录');
  },

  fetchUserInfo: async () => {
    try {
      const response = await authApi.getCurrentUser();
      const user = response.data.data!;
      
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      get().logout();
    }
  },

  setToken: (token: string) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));