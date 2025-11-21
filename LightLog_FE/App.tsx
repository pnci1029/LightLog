import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import Header from './src/components/common/Header';
import DiaryCard from './src/components/home/DiaryCard';
import FloatingActionButton from './src/components/common/FloatingActionButton';
import { theme } from './src/theme/theme';

// Helper to get current date in YYYY년 MM월 DD일 format
const getFormattedDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
};

export default function App() {
  const handleFabPress = () => {
    // Navigate to DiaryWriteScreen in the future
    console.log('FAB pressed!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Header title="LightLog" />

      <View style={styles.content}>
        <Text style={styles.dateText}>{getFormattedDate()}</Text>
        <Text style={styles.welcomeMessage}>오늘 하루는 어땠나요? 가볍게 기록해봐요.</Text>
        <DiaryCard />
      </View>

      <FloatingActionButton onPress={handleFabPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  dateText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeMessage: {
    fontSize: 16,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 30,
  },
});
