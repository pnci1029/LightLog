import { create } from 'zustand';
import diaryService from '../services/diaryService';
import type { Diary, DiaryCreateRequest } from '../services/diaryService';

interface DiaryState {
  // State
  diaries: Diary[];
  currentDiary: Diary | null;
  yesterdayDiary: Diary | null;
  selectedDate: string; // YYYY-MM-DD 형식
  isLoading: boolean;
  error: string | null;

  // Actions
  createDiary: (data: DiaryCreateRequest) => Promise<void>;
  updateDiary: (id: number, data: DiaryCreateRequest) => Promise<void>;
  getDiariesByDate: (date: string) => Promise<void>;
  getYesterdayDiary: () => Promise<void>;
  loadDiaryForDate: (date: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
  clearCurrentDiary: () => void;
  clearError: () => void;
}

export const useDiaryStore = create<DiaryState>((set, get) => ({
  // Initial State
  diaries: [],
  currentDiary: null,
  yesterdayDiary: null,
  selectedDate: new Date().toISOString().split('T')[0], // 오늘 날짜로 초기화
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
        selectedDate: data.date,
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

  updateDiary: async (id: number, data: DiaryCreateRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedDiary = await diaryService.updateDiary(id, data);
      const currentDiaries = get().diaries;
      const updatedDiaries = currentDiaries.map(diary => 
        diary.id === id ? updatedDiary : diary
      );
      set({ 
        diaries: updatedDiaries,
        currentDiary: updatedDiary,
        selectedDate: data.date,
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
        selectedDate: date,
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

  loadDiaryForDate: async (date: string) => {
    set({ isLoading: true, error: null });
    try {
      const diaries = await diaryService.getDiariesByDate(date);
      const diary = diaries.length > 0 ? diaries[0] : null;
      set({ 
        currentDiary: diary,
        selectedDate: date,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({ 
        isLoading: false,
        error: error.message,
        currentDiary: null
      });
      throw error;
    }
  },

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
  },

  clearCurrentDiary: () => set({ currentDiary: null }),

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