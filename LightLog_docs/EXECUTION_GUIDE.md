# 실행 가이드 (Execution Guide)

이 문서는 `LightLog_FE` React Native 프로젝트의 개발 환경을 설정하고 실행하는 방법을 안내합니다. 일반적인 Expo Go 앱 대신 **Development Build** 방식을 사용하여 버전 호환성 문제를 해결하고 안정적인 개발 환경을 구축합니다.

---

## Ⅰ. 최초 1회 설정

PC에서 프로젝트를 처음 설정하거나, 개발용 앱(.apk)을 새로 만들어야 할 때 다음 단계를 따릅니다.

### 1. 프로젝트 폴더 이동

```bash
cd LightLog_FE
```

### 2. 프로젝트 종속성 설치

Node.js 모듈이 설치되어 있지 않다면 먼저 설치합니다.
```bash
npm install
```

### 3. 개발 클라이언트 라이브러리 설치

Development Build에 필요한 `expo-dev-client` 라이브러리를 설치합니다.
```bash
npm install expo-dev-client
```

### 4. EAS-CLI 설치 (전역)

Expo Application Services (EAS)의 커맨드라인 도구를 설치합니다. 이미 설치했더라도 최신 버전 유지를 위해 다시 실행하는 것을 권장합니다.
```bash
npm install -g eas-cli
```

### 5. Expo 계정 로그인

EAS 빌드 서비스를 사용하려면 Expo 계정 로그인이 필요합니다.
```bash
eas login
```
*터미널의 안내에 따라 사용자 이름과 비밀번호를 입력하여 로그인합니다.*

### 6. 개발용 앱 빌드 (Android 예시)

Android용 개발 클라이언트(.apk 파일)를 빌드합니다. iOS가 필요한 경우 `--platform ios`로 변경합니다.
```bash
eas build --platform android --profile development
```
- 빌드 과정은 Expo의 클라우드 서버에서 진행되며, 완료까지 다소 시간이 걸릴 수 있습니다.
- 빌드가 성공적으로 완료되면 터미널에 `.apk` 파일을 다운로드할 수 있는 링크가 표시됩니다.

### 7. 개발용 앱 설치

빌드 완료 후 제공된 링크를 통해 `.apk` 파일을 다운로드하여 사용하는 안드로이드 기기 또는 에뮬레이터에 설치합니다.

---

## Ⅱ. 일상적인 개발

최초 설정이 완료된 후, 평소에 개발을 진행할 때 사용하는 방법입니다.

### 1. 개발 서버 시작

`LightLog_FE` 폴더에서 아래 명령어를 실행하여 개발 서버를 시작합니다.
```bash
npm start -- --dev-client
```

### 2. 앱 실행

개발 서버가 켜진 상태에서, 안드로이드 기기/에뮬레이터에 설치된 **Development Build 앱 (LightLog_FE)** 을 직접 실행합니다. 앱이 자동으로 개발 서버에 연결되며, 코드 수정 시 실시간으로 변경 내용이 반영됩니다.

**이제 Expo Go 앱은 사용하지 않습니다.**

---

## Ⅲ. 앱을 다시 빌드해야 하는 경우

`eas build` 명령어는 매번 실행할 필요가 없으며, 다음과 같이 네이티브 코드에 변경이 있을 경우에만 다시 실행하여 새로운 개발용 앱을 만들어 설치합니다.

- **새로운 네이티브 라이브러리를 추가했을 때** (예: `react-native-maps`, `react-native-camera` 등)
- **Expo SDK 버전을 업그레이드했을 때**
