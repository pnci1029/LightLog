import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../common/Header';
import FloatingActionButton from '../common/FloatingActionButton';
import AIResultView from '../home/AIResultView';
import PastDiariesView from '../home/PastDiariesView';
import YesterdaySummaryModal from '../home/YesterdaySummaryModal';
import { theme } from '../../theme/theme';
import { useDiaryStore } from '../../store/diaryStore';

const ONBOARDING_KEY = '@hasCompletedOnboarding';

interface HomeScreenProps {
  onNavigateToWrite?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToWrite }) => {
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState('어제의 일기를 불러오고 있습니다...');
  
  const { getYesterdayDiary, yesterdayDiary } = useDiaryStore();

  useEffect(() => {
    const initializeHomeScreen = async () => {
      try {
        // 온보딩 상태 확인
        const hasCompleted = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (hasCompleted) {
          // 어제 일기 가져오기
          await getYesterdayDiary();
          
          if (yesterdayDiary) {
            setSummary('오늘 하루는 어땠나요?');
          } else {
            setSummary('첫 일기를 작성해 보세요.');
          }
          setShowModal(false);
        } else {
          // 온보딩이 완료되지 않은 경우 모달 표시
          setShowModal(true);
        }
      } catch (e) {
        console.error('홈 화면 초기화 중 오류 발생:', e);
        setShowModal(true);
      }
    };

    initializeHomeScreen();
  }, []);

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

  const handleFabPress = () => {
    if (onNavigateToWrite) {
      onNavigateToWrite();
    } else {
      console.log('FAB pressed - onNavigateToWrite prop이 없습니다');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="LightLog" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <AIResultView summary={summary} />
        <PastDiariesView />
      </ScrollView>

      <FloatingActionButton onPress={handleFabPress} />

      {/* 온보딩 모달 */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl * 2, // FAB 공간 확보
  },
});

export default HomeScreen;