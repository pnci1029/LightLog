import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme/theme';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  style?: any;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.cardBackground,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: theme.error,
    ...theme.shadows.sm,
  },
  icon: {
    fontSize: theme.fontSize.xl,
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.fontSize.md,
    color: theme.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: theme.main,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  retryButtonText: {
    color: theme.textLight,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
});

export default ErrorMessage;