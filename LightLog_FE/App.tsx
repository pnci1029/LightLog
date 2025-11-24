import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './src/components/common/Header';
import FloatingActionButton from './src/components/common/FloatingActionButton';
import AIResultView from './src/components/home/AIResultView';
import YesterdaySummaryModal from './src/components/home/YesterdaySummaryModal';
import AuthScreen from './src/components/auth/AuthScreen';
import { theme } from './src/theme/theme';
import { useAuthStore } from './src/store/authStore';
import { useDiaryStore } from './src/store/diaryStore';

const ONBOARDING_KEY = '@hasCompletedOnboarding';

export default function App() {
  // --- State Management ---
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState('어제에 대한 AI의 따뜻한 요약을 기다리고 있어요...');
  
  // Auth and Diary stores
  const { isAuthenticated, checkAuthStatus } = useAuthStore();
  const { getYesterdayDiary, yesterdayDiary } = useDiaryStore();

  // --- Logic ---
  // On app load, check authentication and onboarding status
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 인증 상태 확인
        await checkAuthStatus();
        
        if (isAuthenticated) {
          // 로그인된 경우 온보딩 상태 확인
          const hasCompleted = await AsyncStorage.getItem(ONBOARDING_KEY);
          if (hasCompleted) {
            // 어제 일기 가져오기 (실제 백엔드 연동)
            await getYesterdayDiary();
            
            if (yesterdayDiary) {
              setSummary('어제 하루도 정말 멋졌네요! 오늘 당신의 이야기도 들려주세요.');
            } else {
              setSummary('첫 번째 일기를 작성해보세요! 오늘의 이야기를 들려주세요.');
            }
            setShowModal(false);
          } else {
            // 온보딩이 완료되지 않은 경우 모달 표시
            setShowModal(true);
          }
        }
        // 로그인되지 않은 경우는 AuthScreen이 자동으로 표시됨
      } catch (e) {
        console.error('앱 초기화 중 오류 발생:', e);
        setShowModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [isAuthenticated]);

  const handleFabPress = () => {
    // Navigate to DiaryWriteScreen in the future
    console.log('FAB pressed!');
  };

  const handleModalComplete = async (generatedSummary: string) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setSummary(generatedSummary);
      setShowModal(false);
    } catch (e) {
      console.error('Failed to save onboarding status to storage', e);
      setSummary(generatedSummary);
      setShowModal(false);
    }
  };

  const handleAuthSuccess = () => {
    // 로그인 성공 후 앱 다시 초기화
    setIsLoading(true);
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Header title="LightLog" />

      <View style={styles.content}>
        <AIResultView summary={summary} />
      </View>

      <FloatingActionButton onPress={handleFabPress} />

      <Modal
        transparent={true}
        visible={showModal}
        animationType="none"
        onRequestClose={() => {
          // Prevent closing via back button on Android
        }}
      >
        <YesterdaySummaryModal visible={showModal} onComplete={handleModalComplete} />
      </Modal>
    </SafeAreaView>
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
  content: {
    flex: 1,
    padding: 20,
  },
});
