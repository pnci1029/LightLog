import { Audio } from 'expo-av';
import { Alert } from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
}

export class PermissionManager {
  /**
   * 마이크 권한 요청 및 확인
   */
  static async requestMicrophonePermission(): Promise<PermissionResult> {
    try {
      const permission = await Audio.requestPermissionsAsync();
      
      return {
        status: permission.granted ? 'granted' : 'denied',
        canAskAgain: permission.canAskAgain ?? false,
      };
    } catch (error) {
      console.error('마이크 권한 요청 실패:', error);
      return {
        status: 'denied',
        canAskAgain: false,
      };
    }
  }

  /**
   * 현재 마이크 권한 상태 확인
   */
  static async getMicrophonePermissionStatus(): Promise<PermissionStatus> {
    try {
      const permission = await Audio.getPermissionsAsync();
      return permission.granted ? 'granted' : 'denied';
    } catch (error) {
      console.error('마이크 권한 상태 확인 실패:', error);
      return 'denied';
    }
  }

  /**
   * 권한이 거부된 경우 설정 안내 모달 표시
   */
  static showPermissionDeniedAlert(): void {
    Alert.alert(
      '마이크 권한 필요',
      '음성 녹음을 위해 마이크 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '설정으로 이동',
          onPress: () => {
            // iOS/Android 설정 앱으로 이동하는 로직은 추후 구현
            console.log('설정 앱으로 이동 (추후 구현)');
          },
        },
      ]
    );
  }

  /**
   * 권한 요청 전 안내 모달 표시
   */
  static showPermissionRequestAlert(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        '음성 녹음 권한',
        '일기를 음성으로 작성하기 위해 마이크 권한이 필요합니다.',
        [
          {
            text: '거부',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: '허용',
            onPress: () => resolve(true),
          },
        ]
      );
    });
  }

  /**
   * 권한 확인 및 요청 플로우
   */
  static async checkAndRequestPermission(): Promise<PermissionResult> {
    // 1. 현재 권한 상태 확인
    const currentStatus = await this.getMicrophonePermissionStatus();
    
    if (currentStatus === 'granted') {
      return { status: 'granted', canAskAgain: true };
    }

    // 2. 권한 요청 안내
    const userWantsPermission = await this.showPermissionRequestAlert();
    
    if (!userWantsPermission) {
      return { status: 'denied', canAskAgain: false };
    }

    // 3. 실제 권한 요청
    const result = await this.requestMicrophonePermission();
    
    // 4. 권한 거부된 경우 안내
    if (result.status === 'denied' && !result.canAskAgain) {
      this.showPermissionDeniedAlert();
    }

    return result;
  }
}