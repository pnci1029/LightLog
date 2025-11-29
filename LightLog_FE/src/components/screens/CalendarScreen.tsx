import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { theme } from '../../theme/theme';
import Header from '../common/Header';
import diaryService, { Diary } from '../../services/diaryService';

const CalendarScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<string>('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setCurrentMonth(today.substring(0, 7)); // YYYY-MM
    loadMonthDiaries(today.substring(0, 7));
  }, []);

  const loadMonthDiaries = async (month: string) => {
    try {
      setIsLoading(true);
      // TODO: 백엔드에 월별 일기 조회 API 추가 필요
      // 현재는 개별 날짜로만 조회 가능
      const marked: any = {};
      
      // 임시로 현재 선택된 날짜만 체크
      if (selectedDate) {
        try {
          const diaries = await diaryService.getDiariesByDate(selectedDate);
          if (diaries.length > 0) {
            marked[selectedDate] = {
              marked: true,
              dotColor: theme.main,
            };
          }
        } catch (error) {
          // 에러 무시 (일기가 없는 경우)
        }
      }
      
      setMarkedDates(marked);
    } catch (error) {
      console.error('월별 일기 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onDayPress = async (day: DateData) => {
    setSelectedDate(day.dateString);
    setSelectedDiary(null);
    
    try {
      setIsLoading(true);
      const diaries = await diaryService.getDiariesByDate(day.dateString);
      
      if (diaries.length > 0) {
        setSelectedDiary(diaries[0]);
        
        // 선택된 날짜 마킹 업데이트
        const newMarkedDates = {
          ...markedDates,
          [day.dateString]: {
            selected: true,
            selectedColor: theme.main,
            marked: true,
            dotColor: '#fff',
          }
        };
        
        // 이전 선택 제거
        Object.keys(markedDates).forEach(date => {
          if (date !== day.dateString && markedDates[date].selected) {
            newMarkedDates[date] = {
              marked: true,
              dotColor: theme.main,
            };
          }
        });
        
        setMarkedDates(newMarkedDates);
      } else {
        // 선택된 날짜만 표시 (일기 없음)
        const newMarkedDates = {
          ...markedDates,
          [day.dateString]: {
            selected: true,
            selectedColor: theme.textSecondary,
          }
        };
        
        // 이전 선택 제거
        Object.keys(markedDates).forEach(date => {
          if (date !== day.dateString && markedDates[date].selected) {
            if (markedDates[date].marked) {
              newMarkedDates[date] = {
                marked: true,
                dotColor: theme.main,
              };
            } else {
              delete newMarkedDates[date];
            }
          }
        });
        
        setMarkedDates(newMarkedDates);
      }
    } catch (error) {
      Alert.alert('오류', '일기를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const onMonthChange = (month: DateData) => {
    const monthStr = month.dateString.substring(0, 7);
    setCurrentMonth(monthStr);
    loadMonthDiaries(monthStr);
  };

  const formatSelectedDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <View style={styles.container}>
      <Header title="달력" />
      
      <ScrollView style={styles.scrollView}>
        {/* 달력 */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={onDayPress}
            onMonthChange={onMonthChange}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: theme.text,
              selectedDayBackgroundColor: theme.main,
              selectedDayTextColor: '#ffffff',
              todayTextColor: theme.main,
              dayTextColor: theme.text,
              textDisabledColor: theme.textSecondary,
              dotColor: theme.main,
              selectedDotColor: '#ffffff',
              arrowColor: theme.main,
              disabledArrowColor: theme.textSecondary,
              monthTextColor: theme.text,
              indicatorColor: theme.main,
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontWeight: '300',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14
            }}
          />
        </View>

        {/* 선택된 날짜 정보 */}
        {selectedDate && (
          <View style={styles.selectedDateContainer}>
            <Text style={styles.selectedDateText}>
              {formatSelectedDate(selectedDate)}
            </Text>
            
            {isLoading ? (
              <ActivityIndicator color={theme.main} style={styles.loading} />
            ) : selectedDiary ? (
              <View style={styles.diaryContainer}>
                <Text style={styles.diaryLabel}>이날의 일기</Text>
                <ScrollView style={styles.diaryContent} nestedScrollEnabled>
                  <Text style={styles.diaryText}>{selectedDiary.content}</Text>
                </ScrollView>
                <Text style={styles.diaryDate}>
                  작성일: {new Date(selectedDiary.createdAt).toLocaleDateString('ko-KR')}
                </Text>
              </View>
            ) : (
              <View style={styles.noDiaryContainer}>
                <Text style={styles.noDiaryText}>📝</Text>
                <Text style={styles.noDiaryLabel}>이날의 일기가 없습니다</Text>
              </View>
            )}
          </View>
        )}
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
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedDateContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 8,
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
  selectedDateText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  loading: {
    marginVertical: 20,
  },
  diaryContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.background,
    paddingTop: 16,
  },
  diaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },
  diaryContent: {
    maxHeight: 200,
    backgroundColor: theme.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  diaryText: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 24,
  },
  diaryDate: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'right',
  },
  noDiaryContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noDiaryText: {
    fontSize: 32,
    marginBottom: 8,
  },
  noDiaryLabel: {
    fontSize: 16,
    color: theme.textSecondary,
  },
});

export default CalendarScreen;