import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { theme } from '../../theme/theme';

const DiaryCard = () => {
  return (
    <View style={styles.diaryCard}>
      <Text style={styles.diaryCardText}>오늘의 일기를 작성해보세요</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  diaryCard: {
    backgroundColor: theme.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    ...theme.shadows.sm,
  },
  diaryCardText: {
    fontSize: theme.fontSize.md,
    color: theme.textSecondary,
  },
});

export default DiaryCard;
