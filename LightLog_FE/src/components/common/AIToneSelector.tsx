import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { theme } from '../../theme/theme';
import userService, { UserProfile, AITone } from '../../services/userService';

interface AIToneSelectorProps {
  visible: boolean;
  onClose: () => void;
  onToneChanged?: (tone: string) => void;
}

const AIToneSelector: React.FC<AIToneSelectorProps> = ({
  visible,
  onClose,
  onToneChanged
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTone, setSelectedTone] = useState<string>('');

  const availableTones = userService.getAvailableAITones();

  useEffect(() => {
    if (visible) {
      loadUserProfile();
    }
  }, [visible]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await userService.getUserProfile();
      setUserProfile(profile);
      setSelectedTone(profile.aiTone);
    } catch (error: any) {
      Alert.alert('오류', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToneSelect = async (toneId: string) => {
    if (!userProfile) return;

    // 같은 톤이면 아무것도 하지 않음
    if (toneId === userProfile.aiTone) {
      return;
    }

    // 오늘 이미 변경했는지 확인
    if (!userProfile.canChangeToneToday) {
      Alert.alert(
        '변경 제한',
        'AI 톤은 하루에 한 번만 변경할 수 있습니다.\n내일 다시 시도해주세요.',
        [{ text: '확인' }]
      );
      return;
    }

    try {
      setIsUpdating(true);
      const updatedProfile = await userService.updateAiTone(toneId);
      setUserProfile(updatedProfile);
      setSelectedTone(toneId);
      
      const selectedToneInfo = availableTones.find(tone => tone.id === toneId);
      Alert.alert(
        '변경 완료',
        `AI 톤이 "${selectedToneInfo?.name}"으로 변경되었습니다.`,
        [
          {
            text: '확인',
            onPress: () => {
              onToneChanged?.(toneId);
              onClose();
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('오류', error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderToneCard = (tone: AITone) => {
    const isSelected = tone.id === selectedTone;
    const isCurrent = tone.id === userProfile?.aiTone;
    
    return (
      <TouchableOpacity
        key={tone.id}
        style={[styles.toneCard, isSelected && styles.selectedCard]}
        onPress={() => handleToneSelect(tone.id)}
        disabled={isUpdating}
      >
        <View style={styles.toneCardContent}>
          <View style={styles.toneHeader}>
            <Text style={styles.toneIcon}>{tone.icon}</Text>
            <View style={styles.toneInfo}>
              <Text style={[styles.toneName, isSelected && styles.selectedText]}>
                {tone.name}
              </Text>
              {isCurrent && <Text style={styles.currentLabel}>현재 설정</Text>}
            </View>
            {isSelected && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </View>
          <Text style={[styles.toneDescription, isSelected && styles.selectedDescriptionText]}>
            {tone.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AI 톤 설정</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* 내용 */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>
              AI가 어떤 톤으로 응답할지 선택해주세요.
              {userProfile && !userProfile.canChangeToneToday && (
                <Text style={styles.limitNotice}>
                  {'\n'}⚠️ 오늘은 이미 톤을 변경하셨습니다. 내일 다시 변경할 수 있어요.
                </Text>
              )}
            </Text>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.main} />
                <Text style={styles.loadingText}>설정을 불러오는 중...</Text>
              </View>
            ) : (
              <View style={styles.tonesContainer}>
                {availableTones.map(renderToneCard)}
              </View>
            )}

            {isUpdating && (
              <View style={styles.updatingOverlay}>
                <ActivityIndicator size="large" color={theme.main} />
                <Text style={styles.updatingText}>설정을 변경하는 중...</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: theme.textSecondary,
    fontWeight: '300',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  limitNotice: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  tonesContainer: {
    gap: 12,
  },
  toneCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: theme.main + '10',
    borderColor: theme.main,
  },
  toneCardContent: {
    gap: 8,
  },
  toneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toneIcon: {
    fontSize: 24,
  },
  toneInfo: {
    flex: 1,
    gap: 2,
  },
  toneName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  selectedText: {
    color: theme.main,
  },
  currentLabel: {
    fontSize: 12,
    color: theme.main,
    fontWeight: '500',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  toneDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  selectedDescriptionText: {
    color: theme.text,
  },
  updatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  updatingText: {
    fontSize: 16,
    color: theme.text,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default AIToneSelector;