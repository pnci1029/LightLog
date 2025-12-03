import apiClient from './api';

export interface UserProfile {
  username: string;
  nickname: string;
  aiTone: string;
  canChangeToneToday: boolean;
  createdAt: string;
}

export interface UpdateAiToneRequest {
  aiTone: string;
}

export interface AITone {
  id: string;
  name: string;
  description: string;
  icon: string;
}

class UserService {
  // 사용자 프로필 조회
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>('/users/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data || '사용자 정보를 불러오는데 실패했습니다.');
    }
  }

  // AI 톤 변경
  async updateAiTone(aiTone: string): Promise<UserProfile> {
    try {
      const response = await apiClient.put<UserProfile>('/users/ai-tone', { aiTone });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data || 'AI 톤 변경에 실패했습니다.');
    }
  }

  // 사용 가능한 AI 톤 목록
  getAvailableAITones(): AITone[] {
    return [
      {
        id: 'counselor',
        name: '전문 상담사',
        description: '전문적이고 따뜻한 상담사 톤으로 조언을 드려요',
        icon: '👩‍⚕️'
      },
      {
        id: 'friend',
        name: '친한 친구',
        description: '편안하고 친근한 친구처럼 이야기해요',
        icon: '👫'
      }
    ];
  }
}

export default new UserService();