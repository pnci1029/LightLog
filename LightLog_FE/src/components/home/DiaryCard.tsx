import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

const DiaryCard = () => {
  return (
    <View style={styles.diaryCard}>
      <Text style={styles.diaryCardText}>오늘의 일기를 작성해보세요</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  diaryCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  diaryCardText: {
    fontSize: 16,
    color: '#A9A9A9',
  },
});

export default DiaryCard;
