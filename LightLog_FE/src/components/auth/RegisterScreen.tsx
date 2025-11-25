import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { theme } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import authService from '../../services/authService';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
  });

  // 중복 체크 상태
  const [usernameCheck, setUsernameCheck] = useState<{status: 'idle' | 'checking' | 'available' | 'unavailable', message: string}>({
    status: 'idle',
    message: ''
  });
  const [nicknameCheck, setNicknameCheck] = useState<{status: 'idle' | 'checking' | 'available' | 'unavailable', message: string}>({
    status: 'idle',
    message: ''
  });

  // 비밀번호 보기 상태
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const { register, isLoading, error, clearError } = useAuthStore();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
    
    // 아이디나 닉네임 변경 시 중복 체크 상태 리셋
    if (field === 'username') {
      setUsernameCheck({ status: 'idle', message: '' });
    } else if (field === 'nickname') {
      setNicknameCheck({ status: 'idle', message: '' });
    }
  };

  // 아이디 중복 체크
  const checkUsername = async (username: string) => {
    if (username.length < 3) return;
    
    setUsernameCheck({ status: 'checking', message: '확인 중...' });
    
    try {
      const result = await authService.checkUsernameAvailability(username);
      setUsernameCheck({
        status: result.available ? 'available' : 'unavailable',
        message: result.message
      });
    } catch (error: any) {
      setUsernameCheck({ status: 'unavailable', message: error.message });
    }
  };

  // 닉네임 중복 체크
  const checkNickname = async (nickname: string) => {
    if (nickname.length < 1) return;
    
    setNicknameCheck({ status: 'checking', message: '확인 중...' });
    
    try {
      const result = await authService.checkNicknameAvailability(nickname);
      setNicknameCheck({
        status: result.available ? 'available' : 'unavailable',
        message: result.message
      });
    } catch (error: any) {
      setNicknameCheck({ status: 'unavailable', message: error.message });
    }
  };

  // 아이디 중복 체크 버튼 핸들러
  const handleUsernameCheck = () => {
    if (formData.username.trim().length >= 3) {
      checkUsername(formData.username.trim());
    } else {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('아이디는 3자 이상 입력해주세요.');
      }
    }
  };

  // 닉네임 중복 체크 버튼 핸들러
  const handleNicknameCheck = () => {
    if (formData.nickname.trim().length >= 1) {
      checkNickname(formData.nickname.trim());
    } else {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('닉네임을 입력해주세요.');
      }
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('아이디를 입력해주세요.');
      }
      return false;
    }
    
    if (formData.username.length < 3) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('아이디는 3자 이상 입력해주세요.');
      }
      return false;
    }

    if (usernameCheck.status !== 'available') {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('아이디 중복 확인을 완료해주세요.');
      }
      return false;
    }

    if (!formData.password) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('비밀번호를 입력해주세요.');
      }
      return false;
    }

    if (formData.password.length < 6) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('비밀번호는 6자 이상 입력해주세요.');
      }
      return false;
    }

    if (formData.password !== formData.passwordConfirm) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('비밀번호가 일치하지 않습니다.');
      }
      return false;
    }

    if (!formData.nickname.trim()) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('닉네임을 입력해주세요.');
      }
      return false;
    }

    if (nicknameCheck.status !== 'available') {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('닉네임 중복 확인을 완료해주세요.');
      }
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register({
        username: formData.username.trim(),
        password: formData.password,
        nickname: formData.nickname.trim(),
      });
      
      // React Native Web에서 Alert가 작동하지 않으므로 브라우저 네이티브 confirm 사용
      if (typeof window !== 'undefined' && window.confirm) {
        const shouldProceed = window.confirm('회원가입이 완료되었습니다! 로그인 화면으로 이동하시겠습니까?');
        if (shouldProceed) {
          onSwitchToLogin();
        }
      } else {
        // 브라우저 confirm도 안되면 바로 이동
        onSwitchToLogin();
      }
    } catch (err) {
      // React Native Web에서 Alert가 작동하지 않으므로 브라우저 네이티브 alert 사용
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('회원가입 실패: ' + (error || '회원가입 중 오류가 발생했습니다.'));
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>새 계정을 만들어 LightLog를 시작해보세요</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>아이디</Text>
              <View style={styles.inputRowWrapper}>
                <TextInput
                  style={[
                    styles.inputWithButton,
                    usernameCheck.status === 'available' && styles.inputSuccess,
                    usernameCheck.status === 'unavailable' && styles.inputError,
                  ]}
                  placeholder="아이디를 입력하세요 (3자 이상)"
                  value={formData.username}
                  onChangeText={(value) => handleInputChange('username', value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    usernameCheck.status === 'checking' && styles.checkButtonDisabled
                  ]}
                  onPress={handleUsernameCheck}
                  disabled={isLoading || usernameCheck.status === 'checking'}
                >
                  {usernameCheck.status === 'checking' ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.checkButtonText}>중복확인</Text>
                  )}
                </TouchableOpacity>
              </View>
              {usernameCheck.message ? (
                <Text style={[
                  styles.validationMessage,
                  usernameCheck.status === 'available' && styles.successMessage,
                  usernameCheck.status === 'unavailable' && styles.errorMessage,
                ]}>
                  {usernameCheck.message}
                </Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="비밀번호를 입력하세요 (6자 이상)"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.passwordConfirm}
                  onChangeText={(value) => handleInputChange('passwordConfirm', value)}
                  secureTextEntry={!showPasswordConfirm}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
                >
                  <Text style={styles.eyeIcon}>{showPasswordConfirm ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>닉네임</Text>
              <View style={styles.inputRowWrapper}>
                <TextInput
                  style={[
                    styles.inputWithButton,
                    nicknameCheck.status === 'available' && styles.inputSuccess,
                    nicknameCheck.status === 'unavailable' && styles.inputError,
                  ]}
                  placeholder="닉네임을 입력하세요"
                  value={formData.nickname}
                  onChangeText={(value) => handleInputChange('nickname', value)}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    nicknameCheck.status === 'checking' && styles.checkButtonDisabled
                  ]}
                  onPress={handleNicknameCheck}
                  disabled={isLoading || nicknameCheck.status === 'checking'}
                >
                  {nicknameCheck.status === 'checking' ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.checkButtonText}>중복확인</Text>
                  )}
                </TouchableOpacity>
              </View>
              {nicknameCheck.message ? (
                <Text style={[
                  styles.validationMessage,
                  nicknameCheck.status === 'available' && styles.successMessage,
                  nicknameCheck.status === 'unavailable' && styles.errorMessage,
                ]}>
                  {nicknameCheck.message}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>회원가입</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>이미 계정이 있으신가요? </Text>
              <TouchableOpacity onPress={onSwitchToLogin} disabled={isLoading}>
                <Text style={styles.linkText}>로그인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: theme.text,
  },
  inputSuccess: {
    borderColor: '#4CAF50',
  },
  inputError: {
    borderColor: '#f44336',
  },
  checkingIndicator: {
    position: 'absolute',
    right: 12,
    top: 13,
  },
  validationMessage: {
    fontSize: 12,
    marginTop: 4,
  },
  successMessage: {
    color: '#4CAF50',
  },
  errorMessage: {
    color: '#f44336',
  },
  registerButton: {
    height: 50,
    backgroundColor: theme.main,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  linkText: {
    fontSize: 14,
    color: theme.main,
    fontWeight: '600',
  },
  inputRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputWithButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: theme.text,
  },
  checkButton: {
    height: 50,
    paddingHorizontal: 16,
    backgroundColor: theme.main,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  checkButtonDisabled: {
    backgroundColor: theme.textSecondary,
    opacity: 0.6,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  passwordInputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#fff',
    color: theme.text,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  eyeIcon: {
    fontSize: 20,
  },
});

export default RegisterScreen;