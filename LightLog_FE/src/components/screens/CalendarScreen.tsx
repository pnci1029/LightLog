import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';
import Header from '../common/Header';

const CalendarScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header title="달력" />
      <View style={styles.content}>
        <Text style={styles.placeholder}>
          📅 달력 화면이 곧 구현됩니다!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholder: {
    fontSize: 18,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});

export default CalendarScreen;