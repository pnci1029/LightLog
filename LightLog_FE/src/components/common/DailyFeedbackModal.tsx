import React, { useState } from 'react';
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
import diaryService, { DailyFeedbackResponse } from '../../services/diaryService';

interface DailyFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate?: string; // YYYY-MM-DD 형식
}

const DailyFeedbackModal: React.FC<DailyFeedbackModalProps> = ({
  visible,
  onClose,
  selectedDate
}) => {
  const [feedbackData, setFeedbackData] = useState<DailyFeedbackResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateFeedback = async () => {
    setIsLoading(true);
    try {
      const result = await diaryService.getDailyFeedback(selectedDate);
      setFeedbackData(result);
      setHasGenerated(true);
    } catch (error: any) {
      Alert.alert('오류', error.message || 'AI 피드백 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFeedbackData(null);
    setHasGenerated(false);
    onClose();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const renderContent = () => {
    if (!hasGenerated && !isLoading) {
      return (
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>일기 피드백</Text>
          <Text style={styles.introText}>
            {selectedDate ? `${formatDate(selectedDate)} 일기에 대한` : '오늘 작성한 일기에 대한'} 피드백을 받아보세요.
            {'\n\n'}작성한 일기를 분석하여 개선점과 조언을 제공합니다.
          </Text>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.main} />
          <Text style={styles.loadingText}>일기를 분석하고 있습니다...</Text>
          <Text style={styles.loadingSubtext}>잠시만 기다려 주세요</Text>
        </View>
      );
    }

    if (feedbackData) {
      return (
        <View style={styles.feedbackContainer}>
          <View style={styles.feedbackHeader}>
            <Text style={styles.feedbackDate}>
              {formatDate(feedbackData.date)}
            </Text>
            {!feedbackData.hasDiary && (
              <Text style={styles.noDiaryNotice}>
                이 날 작성된 일기가 없습니다
              </Text>
            )}
          </View>

          <View style={styles.feedbackContent}>
            <Text style={styles.feedbackTitle}>피드백</Text>
            <Text style={styles.feedbackText}>{feedbackData.feedback}</Text>
          </View>

          {feedbackData.diaryContent && (
            <View style={styles.diaryPreview}>
              <Text style={styles.diaryPreviewTitle}>오늘의 일기</Text>
              <Text style={styles.diaryPreviewText} numberOfLines={5}>
                {feedbackData.diaryContent}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>일기 피드백</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* 내용 */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderContent()}
          </ScrollView>

          {/* 버튼 영역 */}
          <View style={styles.buttonContainer}>
            {!hasGenerated && !isLoading && (
              <TouchableOpacity
                style={styles.generateButton}
                onPress={generateFeedback}
              >
                <Text style={styles.generateButtonText}>피드백 받기</Text>
              </TouchableOpacity>
            )}

            {hasGenerated && (
              <TouchableOpacity
                style={styles.regenerateButton}
                onPress={generateFeedback}
                disabled={isLoading}
              >
                <Text style={styles.regenerateButtonText}>
                  {isLoading ? '생성 중...' : '다시 생성하기'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
    backgroundColor: theme.background,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    maxHeight: '85%',
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
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.secondary + '30',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.text,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.secondary + '20',
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
    padding: theme.spacing.lg,
  },
  introContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  introIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  introTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.text,
    marginBottom: theme.spacing.sm,
  },
  introText: {
    fontSize: theme.fontSize.md,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: theme.text,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingSubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  feedbackContainer: {
    gap: 16,
  },
  feedbackHeader: {
    gap: 8,
  },
  feedbackDate: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '600',
  },
  noDiaryNotice: {
    fontSize: 14,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  feedbackContent: {
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.main,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.main,
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 24,
  },
  diaryPreview: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  diaryPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
  },
  diaryPreviewText: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  generateButton: {
    backgroundColor: theme.main,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.main,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  regenerateButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  regenerateButtonText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DailyFeedbackModal;