import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { theme } from '../../theme/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.button,
    styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`],
    (disabled || loading) && styles.buttonDisabled,
    style,
  ];

  const buttonTextStyle = [
    styles.buttonText,
    styles[`buttonText${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`buttonText${size.charAt(0).toUpperCase() + size.slice(1)}`],
    (disabled || loading) && styles.buttonTextDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'danger' ? theme.textLight : theme.main} 
        />
      ) : (
        <Text style={buttonTextStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },

  // Variants
  buttonPrimary: {
    backgroundColor: theme.main,
  },
  buttonSecondary: {
    backgroundColor: theme.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.main,
  },
  buttonDanger: {
    backgroundColor: theme.error,
  },

  // Sizes
  buttonSmall: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 36,
  },
  buttonMedium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 48,
  },
  buttonLarge: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: 56,
  },

  // Disabled state
  buttonDisabled: {
    opacity: 0.6,
  },

  // Text styles
  buttonText: {
    fontWeight: '600',
  },
  
  buttonTextPrimary: {
    color: theme.textLight,
    fontSize: theme.fontSize.md,
  },
  buttonTextSecondary: {
    color: theme.text,
    fontSize: theme.fontSize.md,
  },
  buttonTextOutline: {
    color: theme.main,
    fontSize: theme.fontSize.md,
  },
  buttonTextDanger: {
    color: theme.textLight,
    fontSize: theme.fontSize.md,
  },

  buttonTextSmall: {
    fontSize: theme.fontSize.sm,
  },
  buttonTextMedium: {
    fontSize: theme.fontSize.md,
  },
  buttonTextLarge: {
    fontSize: theme.fontSize.lg,
  },

  buttonTextDisabled: {
    opacity: 0.7,
  },
});

export default Button;