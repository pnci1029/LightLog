import React from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  Modal, 
  TouchableWithoutFeedback 
} from 'react-native';
import { theme } from '../../theme/theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = '로딩 중...',
  transparent = true,
}) => {
  if (!visible) return null;

  const content = (
    <View style={styles.container}>
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={theme.main} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );

  if (transparent) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        <TouchableWithoutFeedback>
          {content}
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: theme.cardBackground,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    minWidth: 120,
    ...theme.shadows.md,
  },
  message: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.text,
    textAlign: 'center',
  },
});

export default LoadingOverlay;