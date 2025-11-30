import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { theme } from '../../theme/theme';
import Header from '../common/Header';
import notificationService, { NotificationSettings } from '../../services/notificationService';

interface NotificationSettingsScreenProps {
  onClose?: () => void;
}

interface TimePickerProps {
  time: string;
  onTimeChange: (time: string) => void;
}

interface DaySelectorProps {
  selectedDays: number[];
  onDaysChange: (days: number[]) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ time, onTimeChange }) => {
  const [hour, minute] = time.split(':').map(Number);

  const handleHourChange = (newHour: number) => {
    const formattedHour = newHour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    onTimeChange(`${formattedHour}:${formattedMinute}`);
  };

  const handleMinuteChange = (newMinute: number) => {
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = newMinute.toString().padStart(2, '0');
    onTimeChange(`${formattedHour}:${formattedMinute}`);
  };

  return (
    <View style={styles.timePickerContainer}>
      <Text style={styles.timePickerLabel}>알림 시간</Text>
      <View style={styles.timePicker}>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => {
            Alert.prompt(
              '시간 설정',
              '시간을 입력하세요 (0-23)',
              [
                { text: '취소', style: 'cancel' },
                {
                  text: '확인',
                  onPress: (text) => {
                    const newHour = parseInt(text || '0');
                    if (newHour >= 0 && newHour <= 23) {
                      handleHourChange(newHour);
                    } else {
                      Alert.alert('오류', '올바른 시간을 입력하세요 (0-23)');
                    }
                  },
                },
              ],
              'plain-text',
              hour.toString()
            );
          }}
        >
          <Text style={styles.timeText}>{hour.toString().padStart(2, '0')}</Text>
        </TouchableOpacity>
        
        <Text style={styles.timeSeparator}>:</Text>
        
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => {
            Alert.prompt(
              '분 설정',
              '분을 입력하세요 (0-59)',
              [
                { text: '취소', style: 'cancel' },
                {
                  text: '확인',
                  onPress: (text) => {
                    const newMinute = parseInt(text || '0');
                    if (newMinute >= 0 && newMinute <= 59) {
                      handleMinuteChange(newMinute);
                    } else {
                      Alert.alert('오류', '올바른 분을 입력하세요 (0-59)');
                    }
                  },
                },
              ],
              'plain-text',
              minute.toString()
            );
          }}
        >
          <Text style={styles.timeText}>{minute.toString().padStart(2, '0')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DaySelector: React.FC<DaySelectorProps> = ({ selectedDays, onDaysChange }) => {
  const days = [
    { id: 0, name: '일', short: 'S' },
    { id: 1, name: '월', short: 'M' },
    { id: 2, name: '화', short: 'T' },
    { id: 3, name: '수', short: 'W' },
    { id: 4, name: '목', short: 'T' },
    { id: 5, name: '금', short: 'F' },
    { id: 6, name: '토', short: 'S' },
  ];

  const toggleDay = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      onDaysChange(selectedDays.filter(id => id !== dayId));
    } else {
      onDaysChange([...selectedDays, dayId].sort());
    }
  };

  return (
    <View style={styles.daySelectorContainer}>
      <Text style={styles.daySelectorLabel}>알림 요일</Text>
      <View style={styles.dayButtons}>
        {days.map((day) => (
          <TouchableOpacity
            key={day.id}
            style={[
              styles.dayButton,
              selectedDays.includes(day.id) && styles.dayButtonSelected
            ]}
            onPress={() => toggleDay(day.id)}
          >
            <Text style={[
              styles.dayButtonText,
              selectedDays.includes(day.id) && styles.dayButtonTextSelected
            ]}>
              {day.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    time: '20:00',
    days: [1, 2, 3, 4, 5, 6]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
    initializeNotifications();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await notificationService.getNotificationSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('설정 불러오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeNotifications = async () => {
    try {
      const hasPermission = await notificationService.initialize();
      if (!hasPermission) {
        Alert.alert(
          '알림 권한 필요',
          '일기 리마인더를 받으려면 알림 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
          [{ text: '확인' }]
        );
      }
    } catch (error) {
      console.error('알림 초기화 실패:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await notificationService.saveNotificationSettings(settings);
      Alert.alert('완료', '알림 설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      Alert.alert('오류', '설정을 저장할 수 없습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.sendTestNotification();
      Alert.alert('완료', '테스트 알림을 전송했습니다.');
    } catch (error) {
      console.error('테스트 알림 실패:', error);
      Alert.alert('오류', '테스트 알림을 전송할 수 없습니다.');
    }
  };

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header 
          title="알림 설정" 
          showBackButton={!!onClose}
          onBackPress={onClose}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>설정을 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="알림 설정" 
        showBackButton={!!onClose}
        onBackPress={onClose}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* 알림 활성화 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>일기 리마인더</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>알림 받기</Text>
                <Text style={styles.settingSubtitle}>
                  매일 일정한 시간에 일기 작성 알림을 받습니다
                </Text>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={(enabled) => updateSettings({ enabled })}
                trackColor={{ false: '#e0e0e0', true: theme.main }}
                thumbColor={settings.enabled ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {settings.enabled && (
          <>
            {/* 시간 설정 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>시간 설정</Text>
              <View style={styles.sectionContent}>
                <TimePicker
                  time={settings.time}
                  onTimeChange={(time) => updateSettings({ time })}
                />
              </View>
            </View>

            {/* 요일 설정 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>요일 설정</Text>
              <View style={styles.sectionContent}>
                <DaySelector
                  selectedDays={settings.days}
                  onDaysChange={(days) => updateSettings({ days })}
                />
              </View>
            </View>

            {/* 테스트 및 저장 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>테스트</Text>
              <View style={styles.sectionContent}>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={handleTestNotification}
                >
                  <Text style={styles.testButtonText}>테스트 알림 보내기</Text>
                </TouchableOpacity>
                <Text style={styles.testDescription}>
                  알림이 정상적으로 작동하는지 확인해보세요
                </Text>
              </View>
            </View>
          </>
        )}

        {/* 저장 버튼 */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? '저장 중...' : '설정 저장'}
          </Text>
        </TouchableOpacity>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  timePickerContainer: {
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 16,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeButton: {
    backgroundColor: theme.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginHorizontal: 8,
  },
  daySelectorContainer: {
    alignItems: 'center',
  },
  daySelectorLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 16,
  },
  dayButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.background,
    minWidth: 40,
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: theme.main,
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
  },
  dayButtonTextSelected: {
    color: '#fff',
  },
  testButton: {
    backgroundColor: theme.background,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
  },
  testDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: theme.main,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonDisabled: {
    backgroundColor: theme.textSecondary,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default NotificationSettingsScreen;