import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  TextInput,
  ScrollView,
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
  const [transcribedText, setTranscribedText] = useState('');
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [accumulatedText, setAccumulatedText] = useState('');
  const [recordingCount, setRecordingCount] = useState(0);

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
      
      // 변환된 텍스트를 누적 텍스트에 추가
      const newText = result.transcribedText;
      const combinedText = accumulatedText 
        ? accumulatedText + '\n\n' + newText 
        : newText;
      
      setAccumulatedText(combinedText);
      setTranscribedText(combinedText);
      setRecordingCount(prev => prev + 1);
      setShowTextEditor(true);
      
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
      setTranscribedText('');
      setShowTextEditor(false);
      setAccumulatedText('');
      setRecordingCount(0);
    }
  };

  const retryConversion = () => {
    if (lastRecordingUri) {
      setShowTextEditor(false);
      setTranscribedText('');
      convertToText(lastRecordingUri);
    }
  };

  const handleTextConfirm = () => {
    if (transcribedText.trim()) {
      onTextReady(transcribedText.trim());
      onClose();
    }
  };

  const handleTextCancel = () => {
    setShowTextEditor(false);
    // 누적된 텍스트는 유지하고 현재 편집 중인 텍스트만 리셋
    setTranscribedText(accumulatedText);
  };

  const handleAddMoreRecording = () => {
    setShowTextEditor(false);
    setRecordingComplete(false);
    setLastRecordingUri(null);
    // 누적된 텍스트는 유지
  };

  const handleClearAll = () => {
    setAccumulatedText('');
    setTranscribedText('');
    setRecordingCount(0);
    setShowTextEditor(false);
    setRecordingComplete(false);
    setLastRecordingUri(null);
  };

  const handleProcessCommands = () => {
    const processedText = VoiceService.processVoiceCommands(transcribedText);
    setTranscribedText(processedText);
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
            {recordingCount > 0 && (
              <Text style={styles.recordingCountText}>
                📝 {recordingCount}개의 녹음이 완료되었습니다
              </Text>
            )}
          </View>

          {/* 텍스트 편집 모드 */}
          {showTextEditor ? (
            <View style={styles.textEditorContainer}>
              <Text style={styles.textEditorTitle}>변환된 텍스트 확인 및 수정</Text>
              <ScrollView style={styles.textScrollContainer}>
                <TextInput
                  style={styles.textInput}
                  multiline
                  placeholder="변환된 텍스트가 여기에 표시됩니다..."
                  placeholderTextColor={theme.textSecondary}
                  value={transcribedText}
                  onChangeText={setTranscribedText}
                  autoFocus
                />
              </ScrollView>
              
              {/* 음성 명령어 처리 도움말 */}
              <View style={styles.commandHelpContainer}>
                <Text style={styles.commandHelpText}>
                  💡 음성 명령어: "새줄", "문단바꿈", "마침표", "쉼표" 등
                </Text>
                <TouchableOpacity
                  style={styles.processCommandButton}
                  onPress={handleProcessCommands}
                >
                  <Ionicons name="refresh" size={16} color={theme.main} />
                  <Text style={styles.processCommandText}>명령어 처리</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.multiRecordActions}>
                {recordingCount > 1 && (
                  <TouchableOpacity
                    style={styles.clearAllButton}
                    onPress={handleClearAll}
                  >
                    <Ionicons name="trash-outline" size={16} color={theme.error} />
                    <Text style={styles.clearAllText}>전체 삭제</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={styles.addMoreButton}
                  onPress={handleAddMoreRecording}
                >
                  <Ionicons name="add" size={16} color={theme.main} />
                  <Text style={styles.addMoreText}>추가 녹음</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.textEditActions}>
                <TouchableOpacity
                  style={[styles.textActionButton, styles.cancelTextButton]}
                  onPress={handleTextCancel}
                >
                  <Text style={styles.cancelTextButtonText}>취소</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.textActionButton, styles.confirmTextButton]}
                  onPress={handleTextConfirm}
                  disabled={!transcribedText.trim()}
                >
                  <Text style={styles.confirmTextButtonText}>텍스트 사용</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* 음성 녹음 컴포넌트 */
            <View style={styles.recorderContainer}>
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                onError={handleError}
                maxDuration={300} // 5분 제한
              />
            </View>
          )}

          {/* 재시도 버튼 (변환 실패 시, 텍스트 편집 모드가 아닐 때만) */}
          {!showTextEditor && recordingComplete && !isProcessing && lastRecordingUri && (
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
              {isProcessing 
                ? '변환 중단' 
                : showTextEditor 
                  ? '닫기' 
                  : '취소'
              }
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
  recordingCountText: {
    fontSize: 12,
    color: theme.main,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
    backgroundColor: theme.main + '15',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
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
  textEditorContainer: {
    flex: 1,
    marginBottom: 20,
  },
  textEditorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  textScrollContainer: {
    flex: 1,
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    maxHeight: 200,
  },
  textInput: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
    padding: 0,
  },
  textEditActions: {
    flexDirection: 'row',
    gap: 12,
  },
  textActionButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelTextButton: {
    backgroundColor: theme.textSecondary + '20',
    borderWidth: 1,
    borderColor: theme.textSecondary,
  },
  cancelTextButtonText: {
    color: theme.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmTextButton: {
    backgroundColor: theme.main,
  },
  confirmTextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  commandHelpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.main + '10',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  commandHelpText: {
    flex: 1,
    fontSize: 12,
    color: theme.textSecondary,
    marginRight: 12,
  },
  processCommandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.main + '30',
  },
  processCommandText: {
    fontSize: 12,
    color: theme.main,
    fontWeight: '600',
    marginLeft: 4,
  },
  multiRecordActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.error + '15',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.error + '30',
  },
  clearAllText: {
    fontSize: 12,
    color: theme.error,
    fontWeight: '600',
    marginLeft: 4,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.main + '15',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.main + '30',
  },
  addMoreText: {
    fontSize: 12,
    color: theme.main,
    fontWeight: '600',
    marginLeft: 4,
  },
});