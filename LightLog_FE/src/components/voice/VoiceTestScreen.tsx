import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { VoiceRecorder } from './VoiceRecorder';
import { VoiceService } from '../../services/voiceService';
import { VoiceFileManager, VoiceUtils } from '../../utils/voiceUtils';
import { theme } from '../../theme/theme';
import { LoadingOverlay } from '../common/LoadingOverlay';

export const VoiceTestScreen: React.FC = () => {
  const [transcriptionResult, setTranscriptionResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [recordingInfo, setRecordingInfo] = useState<{
    duration: number;
    uri: string;
  } | null>(null);

  const handleRecordingComplete = async (uri: string, duration: number) => {
    try {
      console.log('녹음 완료:', { uri, duration });
      
      // 녹음 정보 저장
      setRecordingInfo({ uri, duration });
      
      // 파일을 영구 저장소로 복사
      const savedUri = await VoiceFileManager.saveRecording(uri);
      console.log('파일 저장 완료:', savedUri);
      
      Alert.alert(
        '녹음 완료',
        `${VoiceUtils.formatDuration(duration)} 길이의 녹음이 완료되었습니다.\n\n텍스트로 변환하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '변환하기', 
            onPress: () => convertToText(savedUri),
          },
        ]
      );
    } catch (error) {
      console.error('녹음 처리 실패:', error);
      Alert.alert('오류', '녹음 저장에 실패했습니다.');
    }
  };

  const convertToText = async (audioUri: string) => {
    setIsProcessing(true);
    setTranscriptionResult('');
    
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
      
      setTranscriptionResult(result.transcribedText);
      setProcessingStatus('변환 완료!');
      
      Alert.alert(
        '변환 완료',
        `음성이 성공적으로 텍스트로 변환되었습니다.\n\n처리 시간: ${result.processingTimeMs}ms\n신뢰도: ${result.confidence ? VoiceUtils.getQualityText(result.confidence) : '알 수 없음'}`,
        [{ text: '확인' }]
      );
      
    } catch (error) {
      console.error('음성 변환 실패:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : '음성을 텍스트로 변환하는데 실패했습니다.';
        
      Alert.alert('변환 실패', errorMessage);
      setProcessingStatus('변환 실패');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (error: string) => {
    console.error('VoiceRecorder 오류:', error);
    Alert.alert('오류', error);
  };

  const clearAll = async () => {
    Alert.alert(
      '전체 삭제',
      '모든 녹음 파일과 변환 결과를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await VoiceFileManager.clearAllFiles();
              setTranscriptionResult('');
              setRecordingInfo(null);
              setProcessingStatus('');
              Alert.alert('완료', '모든 데이터가 삭제되었습니다.');
            } catch (error) {
              Alert.alert('오류', '데이터 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const checkStorageInfo = async () => {
    try {
      const { totalSize, fileCount } = await VoiceFileManager.getStorageUsage();
      const files = await VoiceFileManager.getStoredFiles();
      
      Alert.alert(
        '저장소 정보',
        `저장된 파일: ${fileCount}개\n총 크기: ${VoiceUtils.formatFileSize(totalSize)}\n\n파일 목록:\n${files.map(f => `• ${f.filename} (${VoiceUtils.formatFileSize(f.size)})`).join('\n')}`
      );
    } catch (error) {
      Alert.alert('오류', '저장소 정보를 확인할 수 없습니다.');
    }
  };

  return (
    <View style={styles.container}>
      {isProcessing && (
        <LoadingOverlay
          visible={isProcessing}
          message={processingStatus}
        />
      )}
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>음성 녹음 테스트</Text>
        
        {/* 음성 녹음 컴포넌트 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>음성 녹음</Text>
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            onError={handleError}
            maxDuration={300} // 5분 제한
          />
        </View>

        {/* 녹음 정보 */}
        {recordingInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>녹음 정보</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                길이: {VoiceUtils.formatDuration(recordingInfo.duration)}
              </Text>
              <Text style={styles.infoText}>
                파일: {recordingInfo.uri.split('/').pop()}
              </Text>
            </View>
          </View>
        )}

        {/* 변환 결과 */}
        {transcriptionResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>변환된 텍스트</Text>
            <View style={styles.transcriptionContainer}>
              <Text style={styles.transcriptionText}>
                {transcriptionResult}
              </Text>
            </View>
          </View>
        )}

        {/* 처리 상태 */}
        {processingStatus && !isProcessing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>상태</Text>
            <Text style={styles.statusText}>
              {processingStatus}
            </Text>
          </View>
        )}

        {/* 액션 버튼들 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>관리</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={checkStorageInfo}
            >
              <Text style={styles.buttonText}>저장소 확인</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={clearAll}
            >
              <Text style={[styles.buttonText, styles.dangerButtonText]}>
                전체 삭제
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 15,
  },
  infoContainer: {
    backgroundColor: theme.cardBackground,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 5,
  },
  transcriptionContainer: {
    backgroundColor: theme.cardBackground,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    minHeight: 100,
  },
  transcriptionText: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 24,
  },
  statusText: {
    fontSize: 14,
    color: theme.success,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: theme.main,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: theme.error,
  },
  dangerButtonText: {
    color: 'white',
  },
});