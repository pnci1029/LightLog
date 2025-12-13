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

export interface PositiveReinterpretationRequest {
  content: string;
  date: string; // YYYY-MM-DD 형식
}

export interface PositiveReinterpretationResponse {
  reinterpretation: string;
}

export interface DailyFeedbackResponse {
  date: string; // YYYY-MM-DD 형식
  diaryContent: string | null;
  feedback: string;
  hasDiary: boolean;
  message: string;
}

export interface DiaryStatistics {
  totalDiaries: number;
  currentMonthDiaries: number;
  longestStreak: number;
  currentStreak: number;
  monthlyStats: MonthlyStats[];
  recentDays: DayStats[];
}

export interface MonthlyStats {
  month: string;
  count: number;
}

export interface DayStats {
  date: string;
  hasEntry: boolean;
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

  // 일기 검색
  async searchDiaries(params: {
    keyword?: string;
    startDate?: string; // YYYY-MM-DD 형식
    endDate?: string; // YYYY-MM-DD 형식
  }): Promise<Diary[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.keyword) queryParams.append('keyword', params.keyword);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await apiClient.get<Diary[]>(`/diaries/search?${queryParams}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data || '일기 검색에 실패했습니다.');
    }
  }

  // 일기 통계 조회
  async getDiaryStatistics(): Promise<DiaryStatistics> {
    try {
      const response = await apiClient.get<DiaryStatistics>('/diaries/statistics');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data || '일기 통계 조회에 실패했습니다.');
    }
  }

  // AI 긍정적 재해석
  async generatePositiveReinterpretation(data: PositiveReinterpretationRequest): Promise<string> {
    try {
      const response = await apiClient.post<PositiveReinterpretationResponse>('/diaries/positive-reinterpretation', data);
      return response.data.reinterpretation;
    } catch (error: any) {
      throw new Error(error.response?.data || '긍정적 재해석 생성에 실패했습니다.');
    }
  }

  // AI 일일 피드백
  async getDailyFeedback(date?: string): Promise<DailyFeedbackResponse> {
    try {
      const params = date ? { date } : {};
      const response = await apiClient.get<DailyFeedbackResponse>('/diaries/daily-feedback', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'AI 피드백 생성에 실패했습니다.');
    }
  }
}

export default new DiaryService();