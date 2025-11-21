import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { theme } from '../../theme/theme';

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
  const { height } = Dimensions.get('window');
  const slideAnim = useRef(new Animated.Value(height)).current;

  // Determine if the submit button should be disabled
  const isSubmitDisabled = selected.length === 0;

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
    }).start(() => onComplete(summary));
  };

  const handleSubmit = () => {
    // If no activities are selected, provide a default summary and close.
    // This part is crucial as the user explicitly asked for no alerts.
    if (isSubmitDisabled) {
        handleClose('별다른 일 없이 평온한 하루를 보냈군요. 그것만으로도 충분히 좋은 하루예요.');
      return;
    }
    // This is a mock summary generation.
    const summary = `${selected.join(', ')} (을)를 하며 하루를 보내셨군요. 오늘도 분명 좋은 일이 있을 거예요!`;
    handleClose(summary);
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.modalContainer}>
      <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.title}>어제는 어떤 하루였나요?</Text>
        <Text style={styles.subtitle}>해당하는 항목을 모두 선택해주세요.</Text>
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
            disabled={isSubmitDisabled} // Disable the TouchableOpacity itself
        >
          <Text style={styles.buttonText}>하루 요약 보기</Text>
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
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 25,
        width: '100%',
        alignItems: 'center',
        paddingBottom: 40, // Add padding for home indicator
      },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 25,
  },
  checklist: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 25,
  },
  chip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 5,
  },
  chipSelected: {
    backgroundColor: theme.main,
  },
  chipText: {
    color: theme.text,
    fontSize: 14,
  },
  chipTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: theme.main,
    borderRadius: 15,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default YesterdaySummaryModal;
