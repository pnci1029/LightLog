import * as FileSystem from 'expo-file-system';
import { Directory } from 'expo-file-system';
import { Audio } from 'expo-av';

export interface VoiceFileInfo {
  uri: string;
  filename: string;
  size: number;
  duration: number;
  createdAt: Date;
}

export interface VoiceUploadResult {
  transcribedText: string;
  processingTimeMs: number;
  language?: string;
  confidence?: number;
  qualityCheck?: {
    isGoodQuality: boolean;
    shouldRetry: boolean;
    issues: string[];
  };
  attempts?: number;
}

export class VoiceFileManager {
  private static readonly VOICE_DIR = FileSystem.documentDirectory + 'voice_recordings/';
  private static readonly MAX_FILES = 10; // 최대 보관할 파일 수

  /**
   * 음성 파일 디렉토리 초기화
   */
  static async initializeDirectory(): Promise<void> {
    try {
      const voiceDir = new Directory(this.VOICE_DIR);
      if (!(await voiceDir.exists)) {
        await voiceDir.create();
      }
    } catch (error) {
      console.error('음성 파일 디렉토리 초기화 실패:', error);
      throw new Error('음성 파일 저장 공간을 초기화할 수 없습니다.');
    }
  }

  /**
   * 녹음 파일을 영구 저장소로 복사
   */
  static async saveRecording(tempUri: string, filename?: string): Promise<string> {
    try {
      await this.initializeDirectory();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const savedFilename = filename || `recording_${timestamp}.m4a`;
      const savedUri = this.VOICE_DIR + savedFilename;
      
      await FileSystem.copyAsync({
        from: tempUri,
        to: savedUri,
      });
      
      // 오래된 파일들 정리
      await this.cleanupOldFiles();
      
      return savedUri;
    } catch (error) {
      console.error('녹음 파일 저장 실패:', error);
      throw new Error('녹음 파일을 저장할 수 없습니다.');
    }
  }

  /**
   * 음성 파일 삭제
   */
  static async deleteFile(uri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (error) {
      console.error('음성 파일 삭제 실패:', error);
      throw new Error('음성 파일을 삭제할 수 없습니다.');
    }
  }

  /**
   * 저장된 음성 파일 목록 조회
   */
  static async getStoredFiles(): Promise<VoiceFileInfo[]> {
    try {
      await this.initializeDirectory();
      
      const voiceDir = new Directory(this.VOICE_DIR);
      const files = await voiceDir.list();
      const fileInfos: VoiceFileInfo[] = [];
      
      for (const file of files) {
        if (file.isFile) {
          try {
            // 오디오 파일 정보 가져오기
            const { sound } = await Audio.Sound.createAsync({ uri: file.uri });
            const status = await sound.getStatusAsync();
            await sound.unloadAsync();
            
            fileInfos.push({
              uri: file.uri,
              filename: file.name,
              size: file.size || 0,
              duration: status.isLoaded ? (status.durationMillis || 0) / 1000 : 0,
              createdAt: new Date(file.modificationTime || 0),
            });
          } catch (audioError) {
            // 오디오 파일이 아닌 경우 건너뛰기
            console.warn('오디오 파일이 아님:', file.name);
          }
        }
      }
      
      // 생성 시간순으로 정렬 (최신순)
      return fileInfos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('저장된 파일 목록 조회 실패:', error);
      return [];
    }
  }

  /**
   * 오래된 파일들 정리 (최대 개수 초과 시)
   */
  static async cleanupOldFiles(): Promise<void> {
    try {
      const files = await this.getStoredFiles();
      
      if (files.length > this.MAX_FILES) {
        const filesToDelete = files.slice(this.MAX_FILES);
        
        for (const file of filesToDelete) {
          await this.deleteFile(file.uri);
        }
      }
    } catch (error) {
      console.error('오래된 파일 정리 실패:', error);
    }
  }

  /**
   * 모든 음성 파일 삭제
   */
  static async clearAllFiles(): Promise<void> {
    try {
      const voiceDir = new Directory(this.VOICE_DIR);
      if (await voiceDir.exists) {
        await voiceDir.delete();
        await this.initializeDirectory();
      }
    } catch (error) {
      console.error('모든 음성 파일 삭제 실패:', error);
      throw new Error('음성 파일을 삭제할 수 없습니다.');
    }
  }

  /**
   * 저장 공간 사용량 계산
   */
  static async getStorageUsage(): Promise<{ totalSize: number; fileCount: number }> {
    try {
      const files = await this.getStoredFiles();
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      
      return {
        totalSize,
        fileCount: files.length,
      };
    } catch (error) {
      console.error('저장 공간 사용량 계산 실패:', error);
      return { totalSize: 0, fileCount: 0 };
    }
  }
}

export class VoiceUtils {
  /**
   * 지속 시간을 사람이 읽기 쉬운 형태로 포맷
   */
  static formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}초`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return remainingSeconds > 0 
        ? `${minutes}분 ${remainingSeconds}초`
        : `${minutes}분`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}시간 ${minutes}분`;
    }
  }

  /**
   * 파일 크기를 사람이 읽기 쉬운 형태로 포맷
   */
  static formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes}B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)}KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    }
  }

  /**
   * 녹음 품질 레벨을 텍스트로 변환
   */
  static getQualityText(confidence?: number): string {
    if (!confidence) return '알 수 없음';
    
    if (confidence >= 0.9) return '매우 좋음';
    if (confidence >= 0.8) return '좋음';
    if (confidence >= 0.7) return '보통';
    if (confidence >= 0.6) return '나쁨';
    return '매우 나쁨';
  }

  /**
   * 음성 파일이 유효한지 확인
   */
  static async validateAudioFile(uri: string): Promise<boolean> {
    try {
      // 파일 크기 확인 - 새로운 API로는 직접 확인이 어려우므로 오디오 로드로 검증
      const { sound } = await Audio.Sound.createAsync({ uri });
      const status = await sound.getStatusAsync();
      await sound.unloadAsync();
      
      return status.isLoaded;
    } catch (error) {
      console.error('음성 파일 검증 실패:', error);
      return false;
    }
  }

  /**
   * 음성 녹음 설정 최적화
   */
  static getOptimizedRecordingOptions(): any {
    return {
      android: {
        extension: '.m4a',
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
        extension: '.m4a',
        outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    };
  }
}