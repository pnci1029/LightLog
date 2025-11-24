import { create } from 'zustand';
import diaryService from '../services/diaryService';
import type { Diary, DiaryCreateRequest } from '../services/diaryService';

interface DiaryState {
  // State
  diaries: Diary[];
  currentDiary: Diary | null;
  yesterdayDiary: Diary | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createDiary: (data: DiaryCreateRequest) => Promise<void>;
  getDiariesByDate: (date: string) => Promise<void>;
  getYesterdayDiary: () => Promise<void>;
  clearError: () => void;
}

export const useDiaryStore = create<DiaryState>((set, get) => ({
  // Initial State
  diaries: [],
  currentDiary: null,
  yesterdayDiary: null,
  isLoading: false,
  error: null,

  // Actions
  createDiary: async (data: DiaryCreateRequest) => {
    set({ isLoading: true, error: null });
    try {
      const newDiary = await diaryService.createDiary(data);
      const currentDiaries = get().diaries;
      set({ 
        diaries: [newDiary, ...currentDiaries],
        currentDiary: newDiary,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({ 
        isLoading: false,
        error: error.message
      });
      throw error;
    }
  },

  getDiariesByDate: async (date: string) => {
    set({ isLoading: true, error: null });
    try {
      const diaries = await diaryService.getDiariesByDate(date);
      set({ 
        diaries,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({ 
        diaries: [],
        isLoading: false,
        error: error.message
      });
    }
  },

  getYesterdayDiary: async () => {
    set({ isLoading: true, error: null });
    try {
      const diary = await diaryService.getYesterdayDiary();
      set({ 
        yesterdayDiary: diary,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({ 
        yesterdayDiary: null,
        isLoading: false,
        error: error.message
      });
    }
  },

  clearError: () => set({ error: null }),
}));