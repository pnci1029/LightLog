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
   * 음성 명령어를 텍스트로 변환하여 처리
   */
  static processVoiceCommands(text: string): string {
    let processedText = text;
    
    // 줄바꿈 명령어들
    const lineBreakCommands = [
      '새 줄', '새줄', '줄바꿈', '줄 바꿈', '엔터', '다음줄', '다음 줄'
    ];
    
    // 문단 바꿈 명령어들
    const paragraphCommands = [
      '문단 바꿈', '문단바꿈', '새 문단', '새문단', '단락 바꿈', '단락바꿈'
    ];
    
    // 구두점 명령어들
    const punctuationCommands = {
      '마침표': '.',
      '쉼표': ',',
      '물음표': '?',
      '느낌표': '!',
      '콜론': ':',
      '세미콜론': ';',
      '따옴표': '"',
      '작은따옴표': "'",
      '괄호열어': '(',
      '괄호닫아': ')',
      '대괄호열어': '[',
      '대괄호닫아': ']'
    };
    
    // 줄바꿈 명령어 처리
    lineBreakCommands.forEach(command => {
      const regex = new RegExp(`\\s*${command}\\s*`, 'gi');
      processedText = processedText.replace(regex, '\n');
    });
    
    // 문단 바꿈 명령어 처리 (두 줄바꿈)
    paragraphCommands.forEach(command => {
      const regex = new RegExp(`\\s*${command}\\s*`, 'gi');
      processedText = processedText.replace(regex, '\n\n');
    });
    
    // 구두점 명령어 처리
    Object.entries(punctuationCommands).forEach(([command, symbol]) => {
      const regex = new RegExp(`\\s*${command}\\s*`, 'gi');
      processedText = processedText.replace(regex, symbol + ' ');
    });
    
    // 연속된 줄바꿈 정리 (3개 이상의 연속 줄바꿈을 2개로 제한)
    processedText = processedText.replace(/\n{3,}/g, '\n\n');
    
    // 앞뒤 공백 정리
    processedText = processedText.trim();
    
    // 구두점 앞의 불필요한 공백 제거
    processedText = processedText.replace(/\s+([.,!?;:])/g, '$1');
    
    return processedText;
  }
  /**
   * 변환된 텍스트 품질 검증
   */
  static evaluateTranscriptionQuality(text: string, confidence?: number): {
    isGoodQuality: boolean;
    shouldRetry: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    let isGoodQuality = true;
    
    // 신뢰도 점수 확인
    if (confidence !== undefined && confidence < 0.7) {
      issues.push('음성 인식 신뢰도가 낮습니다');
      isGoodQuality = false;
    }
    
    // 텍스트 길이 확인 (너무 짧으면 의미 있는 내용이 아닐 가능성)
    if (text.trim().length < 3) {
      issues.push('변환된 텍스트가 너무 짧습니다');
      isGoodQuality = false;
    }
    
    // 의미없는 반복 문자 확인
    const repeatingPattern = /(.)\1{4,}/g;
    if (repeatingPattern.test(text)) {
      issues.push('반복되는 문자가 감지되었습니다');
      isGoodQuality = false;
    }
    
    // 특수문자만으로 구성되어 있는지 확인
    const onlySpecialChars = /^[^\w\s가-힣]+$/g;
    if (onlySpecialChars.test(text.trim())) {
      issues.push('의미 있는 텍스트가 감지되지 않았습니다');
      isGoodQuality = false;
    }
    
    // 재시도 여부 결정 (심각한 품질 문제가 있는 경우에만)
    const shouldRetry = issues.length >= 2 || (confidence !== undefined && confidence < 0.5);
    
    return {
      isGoodQuality,
      shouldRetry,
      issues
    };
  }

  /**
   * 음성 파일을 서버에 업로드하고 텍스트로 변환 (자동 재시도 포함)
   */
  static async uploadAndTranscribe(audioUri: string, maxRetries: number = 2): Promise<VoiceUploadResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
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
        
        // 품질 검증
        const qualityCheck = this.evaluateTranscriptionQuality(
          data.transcribedText, 
          data.confidence
        );
        
        // 품질이 좋지 않고 재시도할 수 있는 경우
        if (!qualityCheck.isGoodQuality && qualityCheck.shouldRetry && attempt < maxRetries) {
          console.warn(`음성 변환 품질 문제 (시도 ${attempt + 1}/${maxRetries + 1}):`, qualityCheck.issues);
          lastError = new Error(`음성 품질 문제: ${qualityCheck.issues.join(', ')}`);
          continue; // 재시도
        }
        
        // 음성 명령어 처리를 적용
        const processedText = this.processVoiceCommands(data.transcribedText);
        
        return {
          transcribedText: processedText,
          processingTimeMs: data.processingTimeMs,
          language: data.language,
          confidence: data.confidence,
          qualityCheck: qualityCheck,
          attempts: attempt + 1
        };
      } catch (error: any) {
        console.error(`음성 업로드 및 변환 실패 (시도 ${attempt + 1}/${maxRetries + 1}):`, error);
        lastError = error;
        
        // 마지막 시도가 아니면 재시도
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // 점진적 지연
          continue;
        }
      }
    }
    
    // 모든 시도 실패 시
    if (lastError) {
      console.error('모든 음성 변환 시도 실패:', lastError);
      
      // 네트워크 오류
      if (!navigator.onLine) {
        throw new Error('인터넷 연결을 확인해주세요.');
      }
      
      // API 오류 상세 처리
      if (lastError.response) {
        const status = lastError.response.status;
        const data = lastError.response.data;
        
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
            throw new Error(data.message || `음성 변환에 실패했습니다. (${maxRetries + 1}회 시도)`);
        }
      }
      
      // 기존 에러가 있으면 그대로 전달
      if (lastError instanceof Error) {
        throw lastError;
      }
    }
    
    // 일반적인 오류
    throw new Error(`음성을 텍스트로 변환할 수 없습니다. (${maxRetries + 1}회 시도)`);
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