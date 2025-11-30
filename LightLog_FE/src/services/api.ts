import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:8080/api';

// API Client 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: JWT 토큰을 자동으로 헤더에 추가
apiClient.interceptors.request.use(
  async (config) => {
    try {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`Token added to request: ${token.substring(0, 20)}...`);
      } else {
        console.log('No token found in storage');
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error(`API Error: ${error.response?.status} ${error.config?.url}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });

    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log(`${error.response?.status} - Token invalid or expired, logging out`);
      // 토큰이 만료되거나 유효하지 않은 경우 로그아웃 처리
      await AsyncStorage.removeItem('@auth_token');
      
      // AuthStore를 통해 로그아웃 상태로 변경
      const { useAuthStore } = await import('../store/authStore');
      const authStore = useAuthStore.getState();
      authStore.user = null;
      authStore.isAuthenticated = false;
      authStore.error = '세션이 만료되었습니다. 다시 로그인해주세요.';
      
      // 페이지 새로고침을 통해 로그인 화면으로 리다이렉트
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;