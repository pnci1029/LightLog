import apiClient from './api';
import { VoiceUploadResult } from '../utils/voiceUtils';

export interface VoiceUploadResponse {
  transcribedText: string;
  processingTimeMs: number;
  language?: string;
  confidence?: number;
}

export interface VoiceUploadError {
  error: string;
  message: string;
  timestamp: number;
}

export class VoiceService {
  /**
   * 음성 파일을 서버에 업로드하고 텍스트로 변환
   */
  static async uploadAndTranscribe(audioUri: string): Promise<VoiceUploadResult> {
    try {
      // FormData 생성
      const formData = new FormData();
      
      if (audioUri.startsWith('blob:')) {
        // 웹에서 blob URI를 File 객체로 변환
        const response = await fetch(audioUri);
        const blob = await response.blob();
        const file = new File([blob], 'voice_recording.m4a', { type: 'audio/m4a' });
        formData.append('file', file);
      } else {
        // React Native에서 파일 업로드를 위한 설정
        const fileInfo = {
          uri: audioUri,
          type: 'audio/m4a',
          name: 'voice_recording.m4a',
        };
        formData.append('file', fileInfo as any);
      }

      // API 호출
      const response = await apiClient.post('/voice/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data: VoiceUploadResponse = response.data;
      
      return {
        transcribedText: data.transcribedText,
        processingTimeMs: data.processingTimeMs,
        language: data.language,
        confidence: data.confidence,
      };
    } catch (error: any) {
      console.error('음성 업로드 및 변환 실패:', error);
      
      // 네트워크 오류
      if (!navigator.onLine) {
        throw new Error('인터넷 연결을 확인해주세요.');
      }
      
      // API 오류 상세 처리
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            throw new Error(data.message || '올바르지 않은 음성 파일입니다.');
          case 401:
            throw new Error('로그인이 필요합니다.');
          case 413:
            throw new Error('파일 크기가 너무 큽니다. (최대 25MB)');
          case 422:
            throw new Error('음성을 인식할 수 없습니다. 더 명확하게 말씀해주세요.');
          case 429:
            throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
          case 500:
            throw new Error('서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          default:
            throw new Error(data.message || '음성 변환에 실패했습니다.');
        }
      }
      
      // 기존 에러가 있으면 그대로 전달
      if (error instanceof Error) {
        throw error;
      }
      
      // 일반적인 오류
      throw new Error('음성을 텍스트로 변환할 수 없습니다. 네트워크 연결을 확인해주세요.');
    }
  }

  /**
   * 음성 변환 서비스 상태 확인
   */
  static async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await apiClient.get('/api/voice/health');
      return response.status === 200 && response.data.status === 'healthy';
    } catch (error) {
      console.error('음성 서비스 상태 확인 실패:', error);
      return false;
    }
  }

  /**
   * 지원하는 오디오 형식 정보 조회
   */
  static async getSupportedFormats(): Promise<{
    supportedFormats: string[];
    maxFileSize: string;
    maxDuration: string;
    language: string;
    model: string;
  }> {
    try {
      const response = await apiClient.get('/api/voice/supported-formats');
      return response.data;
    } catch (error) {
      console.error('지원 형식 정보 조회 실패:', error);
      
      // 기본값 반환
      return {
        supportedFormats: ['mp3', 'wav', 'm4a', 'flac'],
        maxFileSize: '25MB',
        maxDuration: '10 minutes',
        language: 'ko',
        model: 'whisper-1',
      };
    }
  }

  /**
   * 음성 파일 크기 및 형식 사전 검증
   */
  static validateAudioFile(audioUri: string, fileSize: number): {
    isValid: boolean;
    error?: string;
  } {
    // 파일 크기 검증 (25MB)
    const maxSize = 25 * 1024 * 1024;
    if (fileSize > maxSize) {
      return {
        isValid: false,
        error: '파일 크기가 너무 큽니다. 최대 25MB까지 지원됩니다.',
      };
    }

    // 최소 파일 크기 검증 (1KB)
    if (fileSize < 1024) {
      return {
        isValid: false,
        error: '파일이 너무 작습니다. 유효한 음성 파일인지 확인해주세요.',
      };
    }

    // 파일 확장자 검증
    const supportedExtensions = ['.m4a', '.mp3', '.wav', '.flac', '.mp4'];
    const hasValidExtension = supportedExtensions.some(ext => 
      audioUri.toLowerCase().includes(ext)
    );

    if (!hasValidExtension) {
      return {
        isValid: false,
        error: '지원하지 않는 파일 형식입니다.',
      };
    }

    return { isValid: true };
  }

  /**
   * 음성 변환 진행률을 시뮬레이션하는 유틸리티
   * (실제 API는 진행률을 제공하지 않으므로 UX 개선용)
   */
  static simulateProgress(
    onProgress: (progress: number, status: string) => void,
    duration: number = 15000 // 15초 기본값
  ): { cancel: () => void } {
    let progress = 0;
    let cancelled = false;
    
    const steps = [
      { progress: 20, status: '파일을 서버로 업로드 중...', delay: 2000 },
      { progress: 40, status: '음성 분석 중...', delay: 3000 },
      { progress: 60, status: '텍스트로 변환 중...', delay: 4000 },
      { progress: 80, status: '결과를 처리 중...', delay: 3000 },
      { progress: 95, status: '완료 중...', delay: 2000 },
    ];

    let currentStep = 0;
    
    const runNextStep = () => {
      if (cancelled || currentStep >= steps.length) return;
      
      const step = steps[currentStep];
      onProgress(step.progress, step.status);
      
      setTimeout(() => {
        currentStep++;
        runNextStep();
      }, step.delay);
    };

    // 초기 시작
    onProgress(10, '음성 변환을 시작합니다...');
    setTimeout(runNextStep, 1000);

    return {
      cancel: () => {
        cancelled = true;
      },
    };
  }
}