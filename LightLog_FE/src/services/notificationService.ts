import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATION_SETTINGS_KEY = '@notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // HH:MM 형식
  days: number[]; // 0(일) ~ 6(토)
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  time: '20:00',
  days: [1, 2, 3, 4, 5, 6] // 월~토
};

class NotificationService {
  
  async initialize() {
    // 알림 권한 요청
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('알림 권한이 거부되었습니다.');
      return false;
    }

    // 알림 설정
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // 기존 스케줄된 알림들을 확인하고 설정 복원
    await this.restoreNotifications();

    return true;
  }

  // 알림 설정 저장
  async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
      await this.scheduleNotifications(settings);
    } catch (error) {
      console.error('알림 설정 저장 실패:', error);
      throw new Error('알림 설정을 저장할 수 없습니다.');
    }
  }

  // 알림 설정 불러오기
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('알림 설정 불러오기 실패:', error);
      return DEFAULT_SETTINGS;
    }
  }

  // 알림 스케줄링
  async scheduleNotifications(settings: NotificationSettings): Promise<void> {
    try {
      // 기존 알림 모두 취소
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!settings.enabled) {
        return;
      }

      const [hour, minute] = settings.time.split(':').map(Number);

      // 각 요일마다 알림 스케줄
      for (const weekday of settings.days) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "LightLog 📝",
            body: "오늘 하루는 어땠나요? 일기를 작성해보세요!",
            sound: true,
          },
          trigger: {
            weekday: weekday === 0 ? 1 : weekday + 1, // expo의 weekday는 1(월)~7(일)
            hour,
            minute,
            repeats: true,
          },
        });
      }

      console.log('알림이 스케줄되었습니다:', settings);
    } catch (error) {
      console.error('알림 스케줄링 실패:', error);
      throw new Error('알림을 설정할 수 없습니다.');
    }
  }

  // 즉시 테스트 알림 전송
  async sendTestNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "LightLog 테스트 📝",
          body: "알림이 정상적으로 작동합니다!",
          sound: true,
        },
        trigger: null, // 즉시 전송
      });
    } catch (error) {
      console.error('테스트 알림 전송 실패:', error);
      throw new Error('테스트 알림을 전송할 수 없습니다.');
    }
  }

  // 알림 권한 상태 확인
  async checkPermissionStatus(): Promise<boolean> {
    const settings = await Notifications.getPermissionsAsync();
    return settings.status === 'granted';
  }

  // 스케줄된 알림 목록 확인
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // 알림 설정 복원
  private async restoreNotifications(): Promise<void> {
    try {
      const settings = await this.getNotificationSettings();
      if (settings.enabled) {
        await this.scheduleNotifications(settings);
      }
    } catch (error) {
      console.error('알림 설정 복원 실패:', error);
    }
  }

  // 모든 알림 취소
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('모든 알림이 취소되었습니다.');
    } catch (error) {
      console.error('알림 취소 실패:', error);
    }
  }
}

export default new NotificationService();