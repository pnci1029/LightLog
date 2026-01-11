import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VoiceRecorder } from './VoiceRecorder';
import { VoiceService } from '../../services/voiceService';
import { VoiceUtils } from '../../utils/voiceUtils';
import { theme } from '../../theme/theme';
import LoadingOverlay from '../common/LoadingOverlay';

interface VoiceRecordingModalProps {
  visible: boolean;
  onClose: () => void;
  onTextReady: (text: string) => void;
}

export const VoiceRecordingModal: React.FC<VoiceRecordingModalProps> = ({
  visible,
  onClose,
  onTextReady,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [lastRecordingUri, setLastRecordingUri] = useState<string | null>(null);

  const handleRecordingComplete = async (uri: string, duration: number) => {
    try {
      console.log('녹음 완료:', { uri, duration });
      
      setLastRecordingUri(uri);
      setRecordingComplete(true);
      
      // 바로 텍스트 변환 시작 (파일 저장 없이)
      await convertToText(uri);
      
    } catch (error) {
      console.error('녹음 처리 실패:', error);
      Alert.alert('오류', '녹음 처리에 실패했습니다.');
    }
  };

  const convertToText = async (audioUri: string) => {
    setIsProcessing(true);
    
    try {
      // 진행률 시뮬레이션 시작
      const progressController = VoiceService.simulateProgress(
        (progress, status) => {
          setProcessingStatus(`${status} (${progress}%)`);
        }
      );

      // 실제 음성 변환 수행
      const result = await VoiceService.uploadAndTranscribe(audioUri);
      
      // 진행률 시뮬레이션 중지
      progressController.cancel();
      
      // 변환된 텍스트를 부모 컴포넌트로 전달
      onTextReady(result.transcribedText);
      
      // 성공 알림
      Alert.alert(
        '변환 완료',
        `음성이 성공적으로 텍스트로 변환되었습니다!\n\n처리 시간: ${result.processingTimeMs}ms`,
        [{ text: '확인', onPress: () => onClose() }]
      );
      
    } catch (error) {
      console.error('음성 변환 실패:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : '음성을 텍스트로 변환하는데 실패했습니다.';
      
      // 재시도 가능한 에러인지 확인
      const isRetryable = errorMessage.includes('네트워크') || 
                          errorMessage.includes('서버') || 
                          errorMessage.includes('잠시 후');
      
      if (isRetryable) {
        Alert.alert(
          '변환 실패',
          errorMessage,
          [
            { text: '취소', style: 'cancel' },
            { 
              text: '다시 시도', 
              onPress: () => {
                if (lastRecordingUri) {
                  convertToText(lastRecordingUri);
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('변환 실패', errorMessage);
      }
    } finally {
      setIsProcessing(false);
      if (!lastRecordingUri) {
        setRecordingComplete(false);
      }
    }
  };

  const handleError = (error: string) => {
    console.error('VoiceRecorder 오류:', error);
    Alert.alert('오류', error);
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      setRecordingComplete(false);
      setLastRecordingUri(null);
    }
  };

  const retryConversion = () => {
    if (lastRecordingUri) {
      convertToText(lastRecordingUri);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {isProcessing && (
            <LoadingOverlay
              visible={isProcessing}
              message={processingStatus}
            />
          )}
          
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>음성으로 일기 작성</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}
              disabled={isProcessing}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* 설명 */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              🎤 마이크 버튼을 눌러 음성을 녹음하세요
            </Text>
            <Text style={styles.instructionSubText}>
              녹음이 완료되면 자동으로 텍스트로 변환됩니다
            </Text>
          </View>

          {/* 음성 녹음 컴포넌트 */}
          <View style={styles.recorderContainer}>
            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              onError={handleError}
              maxDuration={300} // 5분 제한
            />
          </View>

          {/* 재시도 버튼 (변환 실패 시) */}
          {recordingComplete && !isProcessing && lastRecordingUri && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={retryConversion}
            >
              <Ionicons name="refresh" size={20} color={theme.main} />
              <Text style={styles.retryButtonText}>다시 변환하기</Text>
            </TouchableOpacity>
          )}

          {/* 취소/중단 버튼 */}
          <TouchableOpacity
            style={[styles.cancelButton, isProcessing && styles.cancelButtonDanger]}
            onPress={handleClose}
            disabled={false} // 항상 클릭 가능하게 변경
          >
            <Text style={[styles.cancelButtonText, isProcessing && styles.cancelButtonDangerText]}>
              {isProcessing ? '변환 중단' : '취소'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  closeButton: {
    padding: 4,
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  instructionText: {
    fontSize: 16,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  instructionSubText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  recorderContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.main + '20',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.main,
  },
  retryButtonText: {
    color: theme.main,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: theme.textSecondary + '20',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonDanger: {
    backgroundColor: theme.error + '20',
    borderColor: theme.error,
  },
  cancelButtonDangerText: {
    color: theme.error,
  },
});