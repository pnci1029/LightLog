import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { theme } from '../../theme/theme';
import diaryService from '../../services/diaryService';

interface AIReinterpretationModalProps {
  visible: boolean;
  onClose: () => void;
  diaryContent: string;
  diaryDate: string; // YYYY-MM-DD 형식
}

const AIReinterpretationModal: React.FC<AIReinterpretationModalProps> = ({
  visible,
  onClose,
  diaryContent,
  diaryDate
}) => {
  const [reinterpretation, setReinterpretation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateReinterpretation = async () => {
    if (!diaryContent.trim()) {
      Alert.alert('알림', '일기 내용이 없습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await diaryService.generatePositiveReinterpretation({
        content: diaryContent,
        date: diaryDate
      });
      setReinterpretation(result);
      setHasGenerated(true);
    } catch (error: any) {
      Alert.alert('오류', error.message || 'AI 재해석 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReinterpretation('');
    setHasGenerated(false);
    onClose();
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
            <Text style={styles.headerTitle}>AI 긍정적 재해석</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* 내용 */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {!hasGenerated && !isLoading && (
              <View style={styles.introContainer}>
                <Text style={styles.introText}>
                  AI가 오늘의 일기를 긍정적인 시각으로 재해석해드려요.
                  어려웠던 순간도 성장의 기회로, 좋았던 일은 더욱 의미있게 느낄 수 있도록 도와드릴게요.
                </Text>
              </View>
            )}

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.main} />
                <Text style={styles.loadingText}>AI가 당신의 하루를 새롭게 해석하고 있어요...</Text>
              </View>
            )}

            {hasGenerated && !isLoading && reinterpretation && (
              <View style={styles.reinterpretationContainer}>
                <Text style={styles.reinterpretationTitle}>✨ AI의 긍정적 해석</Text>
                <Text style={styles.reinterpretationText}>{reinterpretation}</Text>
              </View>
            )}
          </ScrollView>

          {/* 버튼 영역 */}
          <View style={styles.buttonContainer}>
            {!hasGenerated && !isLoading && (
              <TouchableOpacity
                style={styles.generateButton}
                onPress={generateReinterpretation}
              >
                <Text style={styles.generateButtonText}>AI 재해석 생성하기</Text>
              </TouchableOpacity>
            )}

            {hasGenerated && (
              <TouchableOpacity
                style={styles.regenerateButton}
                onPress={generateReinterpretation}
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
  introContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  introText: {
    fontSize: 16,
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
    color: theme.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  reinterpretationContainer: {
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 16,
  },
  reinterpretationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.main,
    marginBottom: 12,
  },
  reinterpretationText: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 24,
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

export default AIReinterpretationModal;