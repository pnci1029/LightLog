import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import AuthScreen from './src/components/auth/AuthScreen';
import TabNavigator from './src/components/navigation/TabNavigator';
import { theme } from './src/theme/theme';
import { useAuthStore } from './src/store/authStore';
import notificationService from './src/services/notificationService';

export default function App() {
  // --- State Management ---
  const [isLoading, setIsLoading] = useState(true);
  
  // Auth store
  const { isAuthenticated, checkAuthStatus } = useAuthStore();

  // --- Logic ---
  // On app load, check authentication status
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 인증 상태 확인
        await checkAuthStatus();
        
        // 알림 서비스 초기화 (백그라운드에서)
        notificationService.initialize().catch(error => 
          console.warn('알림 서비스 초기화 실패:', error)
        );
      } catch (e) {
        console.error('앱 초기화 중 오류 발생:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []); // 의존성 배열을 비워서 앱 최초 로딩시에만 실행

  const handleAuthSuccess = async () => {
    // 로그인 성공 후 인증 상태 다시 확인
    setIsLoading(true);
    
    try {
      await checkAuthStatus();
    } catch (e) {
      console.error('로그인 후 초기화 중 오류 발생:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI ---
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.main} />
      </View>
    );
  }

  // 인증되지 않은 경우 로그인/회원가입 화면 표시
  if (!isAuthenticated) {
    return (
      <AuthScreen 
        visible={true} 
        onAuthSuccess={handleAuthSuccess} 
      />
    );
  }

  // 인증된 경우 탭 네비게이션 화면 표시
  return (
    <>
      <StatusBar style="dark" />
      <TabNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
