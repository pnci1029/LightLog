import { create } from 'zustand';
import authService from '../services/authService';
import type { User, LoginRequest, RegisterRequest } from '../services/authService';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      await authService.login(data);
      set({ 
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({ 
        isLoading: false,
        error: error.message,
        isAuthenticated: false
      });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(data);
      set({ isLoading: false, error: null });
      // 회원가입 후 자동 로그인하지 않고 로그인 화면으로 이동하도록 설정
    } catch (error: any) {
      set({ 
        isLoading: false,
        error: error.message
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({ isLoading: false });
    }
  },

  checkAuthStatus: async () => {
    set({ isLoading: true });
    try {
      const isLoggedIn = await authService.isLoggedIn();
      set({
        isAuthenticated: isLoggedIn,
        isLoading: false
      });
    } catch (error) {
      set({
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  clearError: () => set({ error: null }),
}));