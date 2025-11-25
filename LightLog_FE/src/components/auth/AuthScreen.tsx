import React, { useState } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

interface AuthScreenProps {
  visible: boolean;
  onAuthSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ visible, onAuthSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleSwitchToRegister = () => setIsLoginMode(false);
  const handleSwitchToLogin = () => setIsLoginMode(true);

  const handleRegisterSuccess = () => {
    // 회원가입 및 자동 로그인 성공 후 메인 앱으로 이동
    onAuthSuccess();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {isLoginMode ? (
          <LoginScreen
            onSwitchToRegister={handleSwitchToRegister}
            onLoginSuccess={onAuthSuccess}
          />
        ) : (
          <RegisterScreen
            onSwitchToLogin={handleSwitchToLogin}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AuthScreen;