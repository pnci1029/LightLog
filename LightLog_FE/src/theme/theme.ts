// Color Palette (Theme 2: Dusty Rose from fe_guide.md)
export const theme = {
  // Primary Colors
  main: '#DABFDE',      // Dusty Rose
  secondary: '#EADDCD', // Warm Sand
  accent: '#A1C1C4',     // Muted Teal
  
  // Text Colors
  text: '#4B4F54',       // Charcoal Gray
  textSecondary: '#8B8B8B', // Light Gray for secondary text
  textLight: '#FFFFFF',  // White text
  
  // Background Colors
  background: '#F9F7F3', // Off-White
  cardBackground: '#FFFFFF', // Pure white for cards
  
  // UI Colors
  border: '#E0E0E0',     // Light border color
  shadow: 'rgba(0, 0, 0, 0.1)', // Shadow color
  
  // Status Colors
  success: '#4CAF50',    // Green
  warning: '#FF9800',    // Orange  
  error: '#ff4757',      // Red
  info: '#2196F3',       // Blue
  
  // Spacing (8px base unit)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border Radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  
  // Typography
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};
