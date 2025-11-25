import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../theme/theme';

// 임시 화면 컴포넌트들 (나중에 각각의 파일로 분리)
import HomeScreen from '../screens/HomeScreen';
import DiaryWriteScreen from '../screens/DiaryWriteScreen';
import CalendarScreen from '../screens/CalendarScreen';
import SettingsScreen from '../screens/SettingsScreen';

interface TabNavigatorProps {
  // Props 추가 예정
}

type TabType = 'home' | 'write' | 'calendar' | 'settings';

const TabNavigator: React.FC<TabNavigatorProps> = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const tabs = [
    { id: 'home', label: '홈', icon: 'home-outline' },
    { id: 'write', label: '일기쓰기', icon: 'create-outline' },
    { id: 'calendar', label: '달력', icon: 'calendar-outline' },
    { id: 'settings', label: '설정', icon: 'settings-outline' },
  ] as const;

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'write':
        return <DiaryWriteScreen />;
      case 'calendar':
        return <CalendarScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 메인 콘텐츠 */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* 하단 탭 바 */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabItem,
              activeTab === tab.id && styles.tabItemActive
            ]}
            onPress={() => setActiveTab(tab.id as TabType)}
          >
            <Icon 
              name={tab.icon} 
              size={24} 
              color={activeTab === tab.id ? theme.main : theme.textSecondary}
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabLabel,
              activeTab === tab.id && styles.tabLabelActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingVertical: 8,
    paddingBottom: 12, // iOS 홈 인디케이터 여백
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabItemActive: {
    // 활성 탭 스타일
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: theme.main,
    fontWeight: '600',
  },
});

export default TabNavigator;