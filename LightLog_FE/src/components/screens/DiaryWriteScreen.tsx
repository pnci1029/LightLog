import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../theme/theme';
import Header from '../common/Header';
import { useDiaryStore } from '../../store/diaryStore';
import AIReinterpretationModal from '../common/AIReinterpretationModal';
import DailyFeedbackModal from '../common/DailyFeedbackModal';

const DiaryWriteScreen: React.FC = () => {
  const {
    currentDiary,
    selectedDate: storeSelectedDate,
    isLoading,
    error,
    loadDiaryForDate,
    createDiary,
    updateDiary,
    setSelectedDate: setStoreSelectedDate,
    clearError
  } = useDiaryStore();

  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showDailyFeedbackModal, setShowDailyFeedbackModal] = useState(false);
  
  // 수정 모드 여부는 currentDiary가 있는지로 판단
  const isEditing = currentDiary !== null;

  useEffect(() => {
    // 컴포넌트 마운트 시 오늘 날짜로 초기화
    const today = new Date();
    setSelectedDate(today);
    const todayStr = today.toISOString().split('T')[0];
    setStoreSelectedDate(todayStr);
    loadDiaryForDate(todayStr);
  }, []);

  useEffect(() => {
    // currentDiary가 변경될 때 content 업데이트
    if (currentDiary) {
      setContent(currentDiary.content);
    } else {
      setContent('');
    }
  }, [currentDiary]);

  useEffect(() => {
    // 에러 발생 시 Alert 표시
    if (error) {
      Alert.alert('오류', error);
      clearError();
    }
  }, [error]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('알림', '일기 내용을 입력해주세요.');
      return;
    }

    try {
      const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
      
      if (isEditing && currentDiary) {
        // 수정 모드
        await updateDiary(currentDiary.id, {
          content: content.trim(),
          date: dateStr
        });
        Alert.alert('완료', '일기가 수정되었습니다!');
      } else {
        // 새 작성 모드
        await createDiary({
          content: content.trim(),
          date: dateStr
        });
        Alert.alert('완료', '일기가 저장되었습니다!');
      }
    } catch (error: any) {
      // 에러는 store에서 처리되어 useEffect에서 Alert으로 표시됨
      console.error('일기 저장 실패:', error);
    }
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event: any, newDate?: Date) => {
    const currentDate = newDate || selectedDate;
    setShowDatePicker(Platform.OS === 'ios');
    
    // 미래 날짜는 선택할 수 없도록 제한
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 오늘 끝까지로 설정
    
    if (currentDate <= today) {
      setSelectedDate(currentDate);
      const dateStr = currentDate.toISOString().split('T')[0];
      setStoreSelectedDate(dateStr);
      loadDiaryForDate(dateStr);
    } else {
      Alert.alert('알림', '미래 날짜는 선택할 수 없습니다.');
      setShowDatePicker(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title={isEditing ? "일기 수정" : "일기 작성"} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* 날짜 선택 영역 */}
          <TouchableOpacity style={styles.dateSelector} onPress={handleDatePress}>
            <Text style={styles.dateLabel}>작성 날짜</Text>
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>

          {/* 날짜 선택 피커 */}
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={selectedDate}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()} // 오늘까지만 선택 가능
            />
          )}

          {/* 일기 내용 입력 */}
          <View style={styles.contentContainer}>
            <Text style={styles.contentLabel}>오늘의 이야기</Text>
            <TextInput
              style={styles.textInput}
              placeholder="오늘 하루는 어땠나요? 자유롭게 적어보세요..."
              placeholderTextColor={theme.textSecondary}
              multiline
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text style={styles.charCount}>{content.length} / 2000</Text>
          </View>
        </ScrollView>

        {/* 버튼 영역 */}
        <View style={styles.buttonContainer}>
          {/* AI 버튼들 */}
          <View style={styles.aiButtonsContainer}>
            {/* AI 재해석 버튼 - 일기가 있을 때만 표시 */}
            {content.trim() && (
              <TouchableOpacity
                style={[styles.aiButton, styles.aiButtonHalf]}
                onPress={() => setShowAIModal(true)}
              >
                <Text style={styles.aiButtonText}>✨ AI 재해석</Text>
              </TouchableOpacity>
            )}

            {/* AI 일일 피드백 버튼 */}
            <TouchableOpacity
              style={[styles.aiButton, content.trim() ? styles.aiButtonHalf : styles.aiButtonFull]}
              onPress={() => setShowDailyFeedbackModal(true)}
            >
              <Text style={styles.aiButtonText}>🤖 AI 피드백</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, (!content.trim() || isLoading) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!content.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>{isEditing ? "수정하기" : "저장하기"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      
      {/* AI 재해석 모달 */}
      <AIReinterpretationModal
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        diaryContent={content}
        diaryDate={selectedDate.toISOString().split('T')[0]}
      />

      {/* AI 일일 피드백 모달 */}
      <DailyFeedbackModal
        visible={showDailyFeedbackModal}
        onClose={() => setShowDailyFeedbackModal(false)}
        selectedDate={selectedDate.toISOString().split('T')[0]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // 저장 버튼 공간 확보
  },
  dateSelector: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '600',
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentLabel: {
    fontSize: 16,
    color: theme.text,
    marginBottom: 12,
    fontWeight: '600',
  },
  textInput: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 24,
    minHeight: 200,
    textAlignVertical: 'top',
    padding: 0,
  },
  charCount: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'right',
    marginTop: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.background,
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  saveButton: {
    backgroundColor: theme.main,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.main,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: theme.textSecondary,
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  aiButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  aiButton: {
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.main + '30',
  },
  aiButtonHalf: {
    flex: 1,
  },
  aiButtonFull: {
    width: '100%',
  },
  aiButtonText: {
    color: theme.main,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DiaryWriteScreen;