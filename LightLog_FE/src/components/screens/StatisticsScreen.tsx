import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../../theme/theme';
import Header from '../common/Header';
import diaryService, { DiaryStatistics } from '../../services/diaryService';

interface StatisticsScreenProps {
  onClose?: () => void;
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
}

interface CalendarHeatmapProps {
  data: Array<{ date: string; hasEntry: boolean }>;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon }) => {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={styles.statTextContainer}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ data }) => {
  const getDayColor = (hasEntry: boolean): string => {
    return hasEntry ? theme.main : '#e0e0e0';
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const getWeekData = () => {
    const weeks: Array<Array<{ date: string; hasEntry: boolean }>> = [];
    let currentWeek: Array<{ date: string; hasEntry: boolean }> = [];

    data.forEach((day, index) => {
      currentWeek.push(day);
      
      if (currentWeek.length === 7 || index === data.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return weeks;
  };

  return (
    <View style={styles.heatmapContainer}>
      <Text style={styles.heatmapTitle}>최근 30일 작성 현황</Text>
      <View style={styles.heatmapGrid}>
        {getWeekData().map((week, weekIndex) => (
          <View key={weekIndex} style={styles.heatmapWeek}>
            {week.map((day, dayIndex) => (
              <View
                key={day.date}
                style={[
                  styles.heatmapDay,
                  { backgroundColor: getDayColor(day.hasEntry) }
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.heatmapLegend}>
        <Text style={styles.legendText}>적게</Text>
        <View style={styles.legendDots}>
          <View style={[styles.legendDot, { backgroundColor: '#e0e0e0' }]} />
          <View style={[styles.legendDot, { backgroundColor: theme.main }]} />
        </View>
        <Text style={styles.legendText}>많게</Text>
      </View>
    </View>
  );
};

const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ onClose }) => {
  const [statistics, setStatistics] = useState<DiaryStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const stats = await diaryService.getDiaryStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('통계 로드 실패:', error);
      Alert.alert('오류', '통계를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatMonthlyStats = (monthlyStats: any[]) => {
    const recentMonths = monthlyStats.slice(-6);
    const totalInPeriod = recentMonths.reduce((sum, month) => sum + month.count, 0);
    const avgPerMonth = (totalInPeriod / 6).toFixed(1);
    
    return {
      recentMonths,
      avgPerMonth
    };
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header 
          title="통계" 
          showBackButton={!!onClose}
          onBackPress={onClose}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.main} />
          <Text style={styles.loadingText}>통계를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (!statistics) {
    return (
      <View style={styles.container}>
        <Header 
          title="통계" 
          showBackButton={!!onClose}
          onBackPress={onClose}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>통계를 불러올 수 없습니다.</Text>
        </View>
      </View>
    );
  }

  const monthlyData = formatMonthlyStats(statistics.monthlyStats);

  return (
    <View style={styles.container}>
      <Header 
        title="일기 통계" 
        showBackButton={!!onClose}
        onBackPress={onClose}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* 기본 통계 카드들 */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="📚"
            title="전체 일기"
            value={statistics.totalDiaries.toString()}
            subtitle="총 작성한 일기 수"
          />
          <StatCard
            icon="📅"
            title="이번 달"
            value={statistics.currentMonthDiaries.toString()}
            subtitle="이번 달 작성 수"
          />
          <StatCard
            icon="🔥"
            title="현재 연속"
            value={`${statistics.currentStreak}일`}
            subtitle="연속 작성 중"
          />
          <StatCard
            icon="🏆"
            title="최고 연속"
            value={`${statistics.longestStreak}일`}
            subtitle="최고 연속 기록"
          />
        </View>

        {/* 월평균 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>월 평균</Text>
          <View style={styles.sectionContent}>
            <View style={styles.averageContainer}>
              <Text style={styles.averageValue}>{monthlyData.avgPerMonth}</Text>
              <Text style={styles.averageUnit}>편 / 월</Text>
            </View>
            <Text style={styles.averageDescription}>
              최근 6개월 평균 작성 수
            </Text>
          </View>
        </View>

        {/* 최근 활동 히트맵 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>작성 활동</Text>
          <View style={styles.sectionContent}>
            <CalendarHeatmap data={statistics.recentDays} />
          </View>
        </View>

        {/* 월별 통계 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>월별 작성 수</Text>
          <View style={styles.sectionContent}>
            <View style={styles.monthlyChart}>
              {monthlyData.recentMonths.map((month: any, index: number) => (
                <View key={month.month} style={styles.monthlyBar}>
                  <View style={styles.barContainer}>
                    <View 
                      style={[
                        styles.bar,
                        { 
                          height: Math.max(month.count * 20, 4),
                          backgroundColor: month.count > 0 ? theme.main : '#e0e0e0'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.barValue}>{month.count}</Text>
                  <Text style={styles.barLabel}>
                    {new Date(month.month + '-01').toLocaleDateString('ko-KR', { month: 'short' })}
                  </Text>
                </View>
              ))}
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statTextContainer: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
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
  averageContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 8,
  },
  averageValue: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.main,
  },
  averageUnit: {
    fontSize: 16,
    color: theme.textSecondary,
    marginLeft: 4,
  },
  averageDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  heatmapContainer: {
    alignItems: 'center',
  },
  heatmapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  heatmapGrid: {
    flexDirection: 'column',
    gap: 3,
  },
  heatmapWeek: {
    flexDirection: 'row',
    gap: 3,
  },
  heatmapDay: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  legendText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  legendDots: {
    flexDirection: 'row',
    gap: 3,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 1,
  },
  monthlyChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  monthlyBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text,
    marginTop: 4,
  },
  barLabel: {
    fontSize: 10,
    color: theme.textSecondary,
    marginTop: 2,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default StatisticsScreen;