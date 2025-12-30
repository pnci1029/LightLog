import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { theme } from '../../theme/theme';
import diaryService from '../../services/diaryService';

const ACTIVITIES = [
  '업무/공부에 집중했어요',
  '좋은 사람과 대화했어요',
  '휴식을 취했어요',
  '사소한 실수를 했어요',
  '맛있는 음식을 먹었어요',
  '새로운 것을 배웠어요',
];

interface YesterdaySummaryModalProps {
  visible: boolean;
  onComplete: (summary: string) => void;
}

const YesterdaySummaryModal: React.FC<YesterdaySummaryModalProps> = ({ visible, onComplete }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { height } = Dimensions.get('window');
  const slideAnim = useRef(new Animated.Value(height)).current;

  // Determine if the submit button should be disabled
  const isSubmitDisabled = loading;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim, height]);


  const handleSelect = (activity: string) => {
    if (selected.includes(activity)) {
      setSelected(selected.filter((item) => item !== activity));
    } else {
      setSelected([...selected, activity]);
    }
  };

  const handleClose = (summary: string) => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelected([]);
      setLoading(false);
      onComplete(summary);
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const summary = await diaryService.generateSummary({
        activities: selected,
        date: yesterdayStr
      });
      
      handleClose(summary);
    } catch (error: any) {
      Alert.alert('알림', error.message || '요약 생성에 실패했습니다.');
      setLoading(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.modalContainer}>
      <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.title}>어제 하루 되돌아보기</Text>
        <Text style={styles.subtitle}>해당하는 항목을 선택해 주세요.</Text>
        <View style={styles.checklist}>
          {ACTIVITIES.map((activity) => (
            <TouchableOpacity
              key={activity}
              style={[styles.chip, selected.includes(activity) && styles.chipSelected]}
              onPress={() => handleSelect(activity)}
            >
              <Text style={[styles.chipText, selected.includes(activity) && styles.chipTextSelected]}>
                {activity}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
            style={[styles.button, isSubmitDisabled && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>요약 보기</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end', // Align modal to the bottom
        backgroundColor: 'rgba(0,0,0,0.5)',
      },
      modalContent: {
        backgroundColor: theme.background,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        width: '100%',
        alignItems: 'center',
        paddingBottom: theme.spacing.xxl,
      },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  checklist: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 25,
  },
  chip: {
    backgroundColor: theme.secondary + '30',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    margin: theme.spacing.xs,
  },
  chipSelected: {
    backgroundColor: theme.main,
  },
  chipText: {
    color: theme.text,
    fontSize: theme.fontSize.sm,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: theme.main,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default YesterdaySummaryModal;
