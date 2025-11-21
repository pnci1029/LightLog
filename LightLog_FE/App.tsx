import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './src/components/common/Header';
import FloatingActionButton from './src/components/common/FloatingActionButton';
import AIResultView from './src/components/home/AIResultView';
import YesterdaySummaryModal from './src/components/home/YesterdaySummaryModal';
import { theme } from './src/theme/theme';

const ONBOARDING_KEY = '@hasCompletedOnboarding';

export default function App() {
  // --- State Management ---
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState('어제에 대한 AI의 따뜻한 요약을 기다리고 있어요...');

  // --- Logic ---
  // On app load, check if the user has completed the initial modal.
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasCompleted = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (hasCompleted) {
          // If the user has completed onboarding, show a generic welcome back message.
          // In a real app, you would fetch their actual yesterday's summary here.
          setSummary('어제 하루도 정말 멋졌네요! 오늘 당신의 이야기도 들려주세요.');
          setShowModal(false);
        } else {
          // If not, trigger the modal.
          setShowModal(true);
        }
      } catch (e) {
        // If storage fails, default to showing the modal.
        console.error('Failed to read onboarding status from storage', e);
        setShowModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

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
      // Still update the UI even if storage fails
      setSummary(generatedSummary);
      setShowModal(false);
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
