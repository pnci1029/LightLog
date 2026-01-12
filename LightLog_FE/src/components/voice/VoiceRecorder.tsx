import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { PermissionManager } from '../../utils/permissions';
import { theme } from '../../theme/theme';

export interface VoiceRecorderProps {
  onRecordingComplete: (uri: string, duration: number) => void;
  onError: (error: string) => void;
  maxDuration?: number; // seconds
  disabled?: boolean;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  duration: number;
  recordingUri: string | null;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onError,
  maxDuration = 600, // 10분 기본값
  disabled = false,
}) => {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    isPlaying: false,
    duration: 0,
    recordingUri: null,
  });

  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  
  // 녹음 관련 객체
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 애니메이션
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnimValues = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    // 컴포넌트 마운트 시 오디오 설정
    setupAudio();
    
    return () => {
      // 컴포넌트 언마운트 시 정리
      cleanup();
    };
  }, []);

  useEffect(() => {
    // 녹음 중일 때 맥박 애니메이션과 파형 애니메이션
    if (state.isRecording && !state.isPaused) {
      startPulseAnimation();
      startWaveAnimation();
    } else {
      stopPulseAnimation();
      stopWaveAnimation();
    }
  }, [state.isRecording, state.isPaused]);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('오디오 설정 실패:', error);
    }
  };

  const cleanup = async () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }
    
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (error) {
        console.error('녹음 정리 실패:', error);
      }
    }
    
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (error) {
        console.error('사운드 정리 실패:', error);
      }
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const startWaveAnimation = () => {
    const animations = waveAnimValues.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 400 + (index * 100),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 400 + (index * 100),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
        { resetBeforeIteration: true }
      );
    });

    // 각 웨이브를 순차적으로 시작하여 파동 효과 생성
    animations.forEach((animation, index) => {
      setTimeout(() => {
        animation.start();
      }, index * 200);
    });
  };

  const stopWaveAnimation = () => {
    waveAnimValues.forEach(anim => {
      anim.stopAnimation();
      Animated.timing(anim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    });
  };

  const startRecording = async () => {
    try {
      // 권한 확인
      const permissionResult = await PermissionManager.checkAndRequestPermission();
      
      if (permissionResult.status !== 'granted') {
        onError('마이크 권한이 필요합니다.');
        return;
      }

      setPermissionGranted(true);

      // 기존 녹음이 있으면 정리
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }

      // 새 녹음 시작
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      
      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
        recordingUri: null,
      }));

      // 지속 시간 타이머 시작
      startDurationTimer();

    } catch (error) {
      console.error('녹음 시작 실패:', error);
      onError('녹음을 시작할 수 없습니다.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) {
        onError('진행 중인 녹음이 없습니다.');
        return;
      }

      // 녹음 중지
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }

      setState(prev => ({
        ...prev,
        isRecording: false,
        isPaused: false,
        recordingUri: uri,
      }));

      // 녹음 완료 콜백 호출
      if (uri) {
        onRecordingComplete(uri, state.duration);
      }

      recordingRef.current = null;

    } catch (error) {
      console.error('녹음 중지 실패:', error);
      onError('녹음을 중지할 수 없습니다.');
    }
  };

  const pauseRecording = async () => {
    try {
      if (recordingRef.current && state.isRecording) {
        await recordingRef.current.pauseAsync();
        setState(prev => ({ ...prev, isPaused: true }));
        
        if (durationTimerRef.current) {
          clearInterval(durationTimerRef.current);
        }
      }
    } catch (error) {
      console.error('녹음 일시정지 실패:', error);
      onError('녹음을 일시정지할 수 없습니다.');
    }
  };

  const resumeRecording = async () => {
    try {
      if (recordingRef.current && state.isPaused) {
        await recordingRef.current.startAsync();
        setState(prev => ({ ...prev, isPaused: false }));
        startDurationTimer();
      }
    } catch (error) {
      console.error('녹음 재개 실패:', error);
      onError('녹음을 재개할 수 없습니다.');
    }
  };

  const playRecording = async () => {
    try {
      if (!state.recordingUri) {
        onError('재생할 녹음 파일이 없습니다.');
        return;
      }

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: state.recordingUri },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;
      setState(prev => ({ ...prev, isPlaying: true }));

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setState(prev => ({ ...prev, isPlaying: false }));
        }
      });

    } catch (error) {
      console.error('녹음 재생 실패:', error);
      onError('녹음을 재생할 수 없습니다.');
    }
  };

  const deleteRecording = () => {
    Alert.alert(
      '녹음 삭제',
      '이 녹음을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setState(prev => ({
              ...prev,
              recordingUri: null,
              duration: 0,
              isPlaying: false,
            }));
          },
        },
      ]
    );
  };

  const startDurationTimer = () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }

    durationTimerRef.current = setInterval(() => {
      setState(prev => {
        const newDuration = prev.duration + 1;
        
        // 최대 지속 시간 체크
        if (newDuration >= maxDuration) {
          stopRecording();
          onError(`최대 녹음 시간(${Math.floor(maxDuration / 60)}분)에 도달했습니다.`);
          return prev;
        }
        
        return { ...prev, duration: newDuration };
      });
    }, 1000);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordButtonIcon = () => {
    if (state.isRecording) {
      return state.isPaused ? 'play' : 'pause';
    }
    return 'mic';
  };

  const getRecordButtonColor = () => {
    if (disabled) return theme.disabled;
    if (state.isRecording && !state.isPaused) return theme.error;
    if (state.isPaused) return theme.warning;
    return theme.main;
  };

  const handleRecordButtonPress = () => {
    if (disabled) return;

    if (!state.isRecording) {
      startRecording();
    } else if (state.isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  return (
    <View style={styles.container}>
      {/* 녹음 시간 표시 */}
      <View style={styles.durationContainer}>
        <View style={styles.durationWrapper}>
          <Text style={styles.durationLabel}>
            {state.isRecording 
              ? (state.isPaused ? '일시정지' : '녹음 중') 
              : state.recordingUri 
                ? '완료됨'
                : '준비'
            }
          </Text>
          <Text style={[
            styles.durationText,
            state.isRecording && !state.isPaused && styles.durationTextActive
          ]}>
            {formatDuration(state.duration)}
          </Text>
          {maxDuration > 0 && (
            <Text style={styles.maxDurationText}>
              / {formatDuration(maxDuration)}
            </Text>
          )}
        </View>
        {state.isRecording && !state.isPaused && (
          <Animated.View 
            style={[
              styles.recordingIndicator,
              { opacity: pulseAnim.interpolate({
                inputRange: [1, 1.2],
                outputRange: [0.5, 1],
                extrapolate: 'clamp'
              })}
            ]} 
          />
        )}
      </View>
      
      {/* 진행률 바 (녹음 중일 때만 표시) */}
      {state.isRecording && maxDuration > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                { 
                  width: `${(state.duration / maxDuration) * 100}%`,
                  backgroundColor: state.duration / maxDuration > 0.8 
                    ? theme.error 
                    : state.duration / maxDuration > 0.6 
                      ? '#ff9500' 
                      : theme.main
                }
              ]} 
            />
          </View>
        </View>
      )}

      {/* 녹음 버튼 */}
      <View style={styles.controlsContainer}>
        {/* 파형 애니메이션 */}
        {state.isRecording && !state.isPaused && (
          <View style={styles.waveContainer}>
            {waveAnimValues.map((anim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.waveBar,
                  {
                    transform: [{ scaleY: anim }],
                  },
                ]}
              />
            ))}
          </View>
        )}
        
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              { backgroundColor: getRecordButtonColor() },
              disabled && styles.disabledButton,
            ]}
            onPress={handleRecordButtonPress}
            disabled={disabled}
          >
            <Ionicons
              name={getRecordButtonIcon()}
              size={32}
              color="white"
            />
          </TouchableOpacity>
        </Animated.View>
        
        {/* 오른쪽 파형 애니메이션 */}
        {state.isRecording && !state.isPaused && (
          <View style={[styles.waveContainer, styles.waveContainerRight]}>
            {waveAnimValues.map((anim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.waveBar,
                  {
                    transform: [{ scaleY: anim }],
                  },
                ]}
              />
            ))}
          </View>
        )}

        {/* 중지 버튼 (녹음 중일 때만 표시) */}
        {state.isRecording && (
          <TouchableOpacity
            style={[styles.controlButton, styles.stopButton]}
            onPress={stopRecording}
          >
            <Ionicons name="stop" size={20} color="white" />
          </TouchableOpacity>
        )}

        {/* 재생/삭제 버튼 (녹음 완료 후 표시) */}
        {state.recordingUri && !state.isRecording && (
          <View style={styles.playbackControls}>
            <TouchableOpacity
              style={[styles.controlButton, styles.playButton]}
              onPress={playRecording}
              disabled={state.isPlaying}
            >
              <Ionicons
                name={state.isPlaying ? 'pause' : 'play'}
                size={16}
                color="white"
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, styles.deleteButton]}
              onPress={deleteRecording}
            >
              <Ionicons name="trash" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 상태 메시지 */}
      <Text style={styles.statusText}>
        {state.isRecording
          ? state.isPaused
            ? '일시정지됨'
            : '녹음 중...'
          : state.recordingUri
          ? '녹음 완료'
          : '녹음 준비'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  durationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  durationWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  durationLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSecondary,
    marginRight: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  durationText: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.text,
    fontVariant: ['tabular-nums'],
  },
  durationTextActive: {
    color: theme.main,
  },
  maxDurationText: {
    fontSize: 16,
    fontWeight: '400',
    color: theme.textSecondary,
    marginLeft: 4,
    fontVariant: ['tabular-nums'],
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.error,
    marginTop: 4,
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.background,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  stopButton: {
    backgroundColor: theme.error,
  },
  playButton: {
    backgroundColor: theme.success,
  },
  deleteButton: {
    backgroundColor: theme.error,
  },
  playbackControls: {
    flexDirection: 'row',
  },
  disabledButton: {
    opacity: 0.5,
  },
  statusText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: -40,
  },
  waveContainerRight: {
    left: 'auto',
    right: -40,
  },
  waveBar: {
    width: 3,
    height: 20,
    backgroundColor: theme.main,
    marginHorizontal: 1,
    borderRadius: 1.5,
    opacity: 0.7,
  },
});