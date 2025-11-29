import apiClient from './api';

export interface Diary {
  id: number;
  content: string;
  date: string; // YYYY-MM-DD 형식
  createdAt: string;
}

export interface DiaryCreateRequest {
  content: string;
  date: string; // YYYY-MM-DD 형식
}

export interface SummaryRequest {
  activities: string[];
  date: string; // YYYY-MM-DD 형식
}

export interface SummaryResponse {
  summary: string;
}

class DiaryService {
  // 일기 작성
  async createDiary(data: DiaryCreateRequest): Promise<Diary> {
    try {
      const response = await apiClient.post<Diary>('/diaries', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data || '일기 작성에 실패했습니다.');
    }
  }

  // 일기 수정
  async updateDiary(id: number, data: DiaryCreateRequest): Promise<Diary> {
    try {
      const response = await apiClient.put<Diary>(`/diaries/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data || '일기 수정에 실패했습니다.');
    }
  }

  // 특정 날짜 일기 조회
  async getDiariesByDate(date: string): Promise<Diary[]> {
    try {
      const response = await apiClient.get<Diary[]>('/diaries', {
        params: { date }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data || '일기를 불러오는데 실패했습니다.');
    }
  }

  // 어제 일기 가져오기 (헬퍼 메소드)
  async getYesterdayDiary(): Promise<Diary | null> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD 형식

    try {
      const diaries = await this.getDiariesByDate(yesterdayStr);
      return diaries.length > 0 ? diaries[0] : null;
    } catch (error) {
      console.error('어제 일기를 가져오는데 실패했습니다:', error);
      return null;
    }
  }

  // 하루 요약 생성
  async generateSummary(data: SummaryRequest): Promise<string> {
    try {
      const response = await apiClient.post<SummaryResponse>('/diaries/summary', data);
      return response.data.summary;
    } catch (error: any) {
      throw new Error(error.response?.data || '하루 요약 생성에 실패했습니다.');
    }
  }

  // 과거 일기 조회
  async getPastDiaries(): Promise<{ [key: string]: Diary | null }> {
    try {
      const response = await apiClient.get<{ [key: string]: Diary | null }>('/diaries/past');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data || '과거 일기를 불러오는데 실패했습니다.');
    }
  }
}

export default new DiaryService();