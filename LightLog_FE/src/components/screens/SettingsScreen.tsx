import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { theme } from '../../theme/theme';
import Header from '../common/Header';
import { useAuthStore } from '../../store/authStore';
import backupService from '../../services/backupService';

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  textColor?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  showArrow = true, 
  textColor = theme.text 
}) => {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingItemLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: textColor }]}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Text style={styles.settingArrow}>›</Text>
      )}
    </TouchableOpacity>
  );
};

interface SettingsScreenProps {
  onNavigateToSearch?: () => void;
  onNavigateToStatistics?: () => void;
  onNavigateToNotifications?: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigateToSearch, onNavigateToStatistics, onNavigateToNotifications }) => {
  const { logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
            } catch (error) {
              console.error('로그아웃 실패:', error);
              Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleDataBackup = async () => {
    try {
      setIsBackingUp(true);
      
      // 백업 미리보기 가져오기
      const preview = await backupService.getBackupPreview();
      
      Alert.alert(
        '데이터 백업',
        `총 ${preview.totalDiaries}개의 일기를 백업합니다.\n${preview.dateRange ? `기간: ${preview.dateRange.start} ~ ${preview.dateRange.end}` : ''}\n\n백업 파일을 저장하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '백업',
            onPress: async () => {
              try {
                await backupService.exportData();
                Alert.alert('완료', '데이터 백업이 완료되었습니다.');
              } catch (error: any) {
                Alert.alert('오류', error.message || '백업 중 오류가 발생했습니다.');
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('오류', error.message || '백업을 준비하는 중 오류가 발생했습니다.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDataRestore = () => {
    Alert.alert(
      '데이터 복원',
      '백업 파일을 선택하여 일기 데이터를 복원합니다.\n기존 일기와 같은 날짜의 일기는 어떻게 처리하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '건너뛰기',
          onPress: () => performRestore(false),
        },
        {
          text: '덮어쓰기',
          onPress: () => performRestore(true),
          style: 'destructive',
        },
      ]
    );
  };

  const performRestore = async (overwrite: boolean) => {
    try {
      setIsRestoring(true);
      const result = await backupService.importData(overwrite);
      
      Alert.alert(
        '복원 완료',
        `${result.imported}개 일기 복원됨\n${result.skipped}개 일기 건너뜀\n${result.errors.length > 0 ? `${result.errors.length}개 오류 발생` : ''}`,
        [{ text: '확인' }]
      );
    } catch (error: any) {
      Alert.alert('오류', error.message || '복원 중 오류가 발생했습니다.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleNotificationSettings = () => {
    Alert.alert('준비중', '알림 설정 기능이 곧 추가될 예정입니다.');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('준비중', '개인정보처리방침이 곧 추가될 예정입니다.');
  };

  const handleTermsOfService = () => {
    Alert.alert('준비중', '이용약관이 곧 추가될 예정입니다.');
  };

  return (
    <View style={styles.container}>
      <Header title="설정" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* 앱 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 설정</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="🔔"
              title="알림 설정"
              subtitle="일기 작성 리마인더"
              onPress={() => onNavigateToNotifications ? onNavigateToNotifications() : handleNotificationSettings()}
            />
            <SettingItem
              icon="📊"
              title="통계 보기"
              subtitle="나의 일기 작성 통계"
              onPress={() => onNavigateToStatistics ? onNavigateToStatistics() : Alert.alert('준비중', '통계 기능이 곧 추가될 예정입니다.')}
            />
          </View>
        </View>

        {/* 데이터 관리 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>데이터 관리</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="💾"
              title="데이터 백업"
              subtitle={isBackingUp ? "백업 중..." : "일기 데이터를 파일로 저장"}
              onPress={isBackingUp ? undefined : handleDataBackup}
            />
            <SettingItem
              icon="📥"
              title="데이터 복원"
              subtitle={isRestoring ? "복원 중..." : "백업 파일에서 일기 데이터 가져오기"}
              onPress={isRestoring ? undefined : handleDataRestore}
            />
            <SettingItem
              icon="🔍"
              title="일기 검색"
              subtitle="키워드로 일기 찾기"
              onPress={() => onNavigateToSearch ? onNavigateToSearch() : Alert.alert('준비중', '일기 검색 기능이 곧 추가될 예정입니다.')}
            />
          </View>
        </View>

        {/* 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>정보</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="📄"
              title="이용약관"
              onPress={handleTermsOfService}
            />
            <SettingItem
              icon="🔒"
              title="개인정보처리방침"
              onPress={handlePrivacyPolicy}
            />
            <SettingItem
              icon="ℹ️"
              title="앱 버전"
              subtitle="1.0.0"
              showArrow={false}
            />
          </View>
        </View>

        {/* 계정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.logoutIcon}>🚪</Text>
                  <Text style={styles.logoutText}>로그아웃</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.background,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  settingArrow: {
    fontSize: 20,
    color: theme.textSecondary,
    fontWeight: '300',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4757',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    margin: 20,
    shadowColor: '#ff4757',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default SettingsScreen;