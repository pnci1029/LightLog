import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { theme } from '../../theme/theme';

interface AIResultViewProps {
  summary: string;
}

const AIResultView: React.FC<AIResultViewProps> = ({ summary }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>어제의 당신에게,</Text>
      <Text style={styles.summaryText}>{summary}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    flex: 1,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 18,
    lineHeight: 28,
    color: theme.text,
    textAlign: 'center',
  },
});

export default AIResultView;
