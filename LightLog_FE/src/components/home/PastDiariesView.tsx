import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable
} from 'react-native';
import { theme } from '../../theme/theme';
import diaryService, { Diary } from '../../services/diaryService';

interface PastDiariesViewProps {}

interface DiaryModalProps {
  visible: boolean;
  diary: Diary | null;
  onClose: () => void;
  period: string;
}

const DiaryModal: React.FC<DiaryModalProps> = ({ visible, diary, onClose, period }) => {
  if (!diary) return null;

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{period} 전의 일기</Text>
            <Text style={styles.modalDate}>{formatDate(diary.date)}</Text>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalText}>{diary.content}</Text>
          </ScrollView>
          
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>닫기</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const PastDiariesView: React.FC<PastDiariesViewProps> = () => {
  const [pastDiaries, setPastDiaries] = useState<{ [key: string]: Diary | null }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState<{ diary: Diary | null; period: string }>({
    diary: null,
    period: ''
  });
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadPastDiaries();
  }, []);

  const loadPastDiaries = async () => {
    try {
      setIsLoading(true);
      const data = await diaryService.getPastDiaries();
      setPastDiaries(data);
    } catch (error) {
      console.error('과거 일기 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiaryPress = (diary: Diary | null, period: string) => {
    if (diary) {
      setSelectedDiary({ diary, period });
      setModalVisible(true);
    }
  };

  const formatPeriod = (key: string): string => {
    switch (key) {
      case '1month': return '1개월';
      case '3months': return '3개월';
      case '6months': return '6개월';
      case '12months': return '1년';
      default: return key;
    }
  };

  const getPreviewText = (content: string, maxLength: number = 50): string => {
    return content.length > maxLength ? content.slice(0, maxLength) + '...' : content;
  };

  // 일기가 있는 것들만 필터링
  const availableDiaries = Object.entries(pastDiaries).filter(([_, diary]) => diary !== null);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>과거의 오늘</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.main} />
          <Text style={styles.loadingText}>과거 일기를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (availableDiaries.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>과거의 오늘</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>과거의 오늘에 작성한 일기가 없어요</Text>
          <Text style={styles.emptySubText}>더 많은 일기를 작성하면 추억을 되돌아볼 수 있어요!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>과거의 오늘</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.diariesScroll}>
        {availableDiaries.map(([key, diary]) => (
          <TouchableOpacity
            key={key}
            style={styles.diaryCard}
            onPress={() => handleDiaryPress(diary, formatPeriod(key))}
          >
            <Text style={styles.cardPeriod}>{formatPeriod(key)} 전</Text>
            <Text style={styles.cardDate}>
              {new Date(diary!.date + 'T00:00:00').toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
              })}
            </Text>
            <Text style={styles.cardPreview}>{getPreviewText(diary!.content)}</Text>
            <Text style={styles.cardAction}>자세히 보기 →</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <DiaryModal
        visible={modalVisible}
        diary={selectedDiary.diary}
        period={selectedDiary.period}
        onClose={() => {
          setModalVisible(false);
          setSelectedDiary({ diary: null, period: '' });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
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
  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 12,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
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
  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  diariesScroll: {
    flexGrow: 0,
  },
  diaryCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPeriod: {
    fontSize: 12,
    color: theme.main,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  cardPreview: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
    marginBottom: 12,
    minHeight: 40,
  },
  cardAction: {
    fontSize: 12,
    color: theme.main,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxWidth: '100%',
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.background,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  modalBody: {
    maxHeight: 300,
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 24,
  },
  modalCloseButton: {
    backgroundColor: theme.main,
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PastDiariesView;