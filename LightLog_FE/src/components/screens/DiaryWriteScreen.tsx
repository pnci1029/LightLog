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
import { theme } from '../../theme/theme';
import Header from '../common/Header';
import diaryService from '../../services/diaryService';

const DiaryWriteScreen: React.FC = () => {
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [diaryId, setDiaryId] = useState<number | null>(null);

  useEffect(() => {
    loadTodayDiary();
  }, []);

  const loadTodayDiary = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
      const diaries = await diaryService.getDiariesByDate(today);
      
      if (diaries.length > 0) {
        // 오늘 일기가 있으면 수정 모드
        const todayDiary = diaries[0];
        setContent(todayDiary.content);
        setIsEditing(true);
        setDiaryId(todayDiary.id);
        console.log('기존 일기 불러옴 - 수정 모드');
      } else {
        // 오늘 일기가 없으면 새 작성 모드
        setIsEditing(false);
        setDiaryId(null);
        console.log('새 일기 작성 모드');
      }
    } catch (error) {
      console.error('오늘 일기 확인 중 오류:', error);
      // 에러가 발생해도 새 작성 모드로 진행
      setIsEditing(false);
      setDiaryId(null);
    }
  };

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

    setIsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
      
      if (isEditing && diaryId) {
        // 수정 모드
        await diaryService.updateDiary(diaryId, {
          content: content.trim(),
          date: dateStr
        });
        Alert.alert('완료', '일기가 수정되었습니다!');
      } else {
        // 새 작성 모드
        const newDiary = await diaryService.createDiary({
          content: content.trim(),
          date: dateStr
        });
        // 저장 후 수정 모드로 전환
        setIsEditing(true);
        setDiaryId(newDiary.id);
        Alert.alert('완료', '일기가 저장되었습니다!');
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '일기 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDatePress = () => {
    // TODO: 날짜 선택 모달 구현 예정
    Alert.alert('알림', '날짜 선택 기능이 곧 구현됩니다!');
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

        {/* 저장 버튼 */}
        <View style={styles.buttonContainer}>
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
});

export default DiaryWriteScreen;