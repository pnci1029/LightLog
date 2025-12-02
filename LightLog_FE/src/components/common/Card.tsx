import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'medium',
  shadow = 'medium',
}) => {
  const cardStyle = [
    styles.card,
    padding !== 'none' && styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    shadow !== 'none' && theme.shadows[shadow],
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.cardBackground,
    borderRadius: theme.borderRadius.md,
  },

  // Padding variants
  paddingSmall: {
    padding: theme.spacing.md,
  },
  paddingMedium: {
    padding: theme.spacing.lg,
  },
  paddingLarge: {
    padding: theme.spacing.xl,
  },
});

export default Card;