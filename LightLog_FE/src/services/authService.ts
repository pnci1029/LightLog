import apiClient from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: number;
  username: string;
  nickname: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  nickname: string;
}

export interface AuthResponse {
  token: string;
}

class AuthService {
  // 회원가입
  async register(data: RegisterRequest): Promise<string> {
    try {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data || '회원가입에 실패했습니다.');
    }
  }

  // 로그인
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      const { token } = response.data;
      
      // JWT 토큰을 AsyncStorage에 저장
      await AsyncStorage.setItem('@auth_token', token);
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data || '로그인에 실패했습니다.');
    }
  }

  // 로그아웃
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@auth_token');
    } catch (error) {
      console.error('로그아웃 중 오류가 발생했습니다:', error);
    }
  }

  // 토큰 확인
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('@auth_token');
    } catch (error) {
      console.error('토큰을 가져오는 중 오류가 발생했습니다:', error);
      return null;
    }
  }

  // 로그인 상태 확인
  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  // 아이디 중복 체크
  async checkUsernameAvailability(username: string): Promise<{available: boolean, message: string}> {
    try {
      const response = await apiClient.get(`/auth/check-username?username=${encodeURIComponent(username)}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data || '아이디 중복 체크에 실패했습니다.');
    }
  }

  // 닉네임 중복 체크
  async checkNicknameAvailability(nickname: string): Promise<{available: boolean, message: string}> {
    try {
      const response = await apiClient.get(`/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data || '닉네임 중복 체크에 실패했습니다.');
    }
  }
}

export default new AuthService();