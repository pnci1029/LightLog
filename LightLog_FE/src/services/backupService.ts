import { Alert, Platform } from 'react-native';
import apiClient from './api';

export interface BackupData {
  user: {
    username: string;
    nickname: string;
    createdAt: string;
  };
  diaries: Array<{
    content: string;
    date: string;
    createdAt: string;
  }>;
  exportedAt: string;
  version: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  message: string;
}

class BackupService {
  // 데이터 백업
  async exportData(): Promise<void> {
    try {
      // 백엔드에서 데이터 가져오기
      const response = await apiClient.get<BackupData>('/diaries/export');
      const backupData = response.data;

      // 브라우저에서는 JSON 데이터를 콘솔에 출력하여 복사 가능하도록 함
      const jsonString = JSON.stringify(backupData, null, 2);
      console.log('백업 데이터:', jsonString);
      
      Alert.alert(
        '백업 완료',
        '백업 데이터가 준비되었습니다.\n개발자 도구 콘솔을 확인하여 데이터를 복사하세요.',
        [{ text: '확인' }]
      );
      
    } catch (error: any) {
      throw new Error(error.response?.data || '데이터 백업에 실패했습니다.');
    }
  }

  // 데이터 복원
  async importData(overwriteExisting: boolean = false): Promise<ImportResult> {
    try {
      // 간단한 프롬프트로 JSON 데이터 입력받기
      return new Promise((resolve, reject) => {
        Alert.prompt(
          '데이터 복원',
          '백업된 JSON 데이터를 붙여넣으세요:',
          [
            { text: '취소', style: 'cancel', onPress: () => reject(new Error('취소되었습니다.')) },
            {
              text: '복원',
              onPress: async (jsonString) => {
                try {
                  if (!jsonString) {
                    throw new Error('데이터가 입력되지 않았습니다.');
                  }

                  // JSON 파싱
                  const backupData: BackupData = JSON.parse(jsonString);
                  
                  // 백업 데이터 유효성 검사
                  this.validateBackupData(backupData);

                  // 백엔드로 데이터 전송
                  const importResponse = await apiClient.post<ImportResult>('/diaries/import', {
                    diaries: backupData.diaries.map(diary => ({
                      content: diary.content,
                      date: diary.date,
                    })),
                    overwriteExisting,
                  });

                  resolve(importResponse.data);
                } catch (error: any) {
                  reject(new Error(error.response?.data || error.message || '데이터 복원에 실패했습니다.'));
                }
              },
            },
          ],
          'plain-text'
        );
      });
    } catch (error: any) {
      throw new Error(error.message || '데이터 복원에 실패했습니다.');
    }
  }

  // 백업 데이터 유효성 검사
  private validateBackupData(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new Error('유효하지 않은 백업 파일입니다.');
    }

    if (!data.user || !data.diaries || !Array.isArray(data.diaries)) {
      throw new Error('백업 파일 형식이 올바르지 않습니다.');
    }

    if (!data.version) {
      throw new Error('지원되지 않는 백업 파일 버전입니다.');
    }

    // 일기 데이터 유효성 검사
    for (const diary of data.diaries) {
      if (!diary.content || !diary.date) {
        throw new Error('백업 파일에 유효하지 않은 일기 데이터가 있습니다.');
      }
    }
  }


  // 백업 데이터 미리보기
  async getBackupPreview(): Promise<{
    totalDiaries: number;
    dateRange: { start: string; end: string } | null;
    sampleDiary: string | null;
  }> {
    try {
      const response = await apiClient.get<BackupData>('/diaries/export');
      const backupData = response.data;
      
      const totalDiaries = backupData.diaries.length;
      
      let dateRange: { start: string; end: string } | null = null;
      if (totalDiaries > 0) {
        const dates = backupData.diaries.map(d => d.date).sort();
        dateRange = {
          start: dates[0],
          end: dates[dates.length - 1],
        };
      }
      
      const sampleDiary = totalDiaries > 0 
        ? backupData.diaries[0].content.substring(0, 50) + (backupData.diaries[0].content.length > 50 ? '...' : '')
        : null;
      
      return { totalDiaries, dateRange, sampleDiary };
    } catch (error: any) {
      throw new Error(error.response?.data || '백업 미리보기를 가져올 수 없습니다.');
    }
  }
}

export default new BackupService();