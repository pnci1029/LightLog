# LightLog 프론트엔드 상세 기획서

**문서 버전: 1.0.0**

## 1. 서비스 개요 및 목표

LightLog는 사용자에게 **매일 감성적인 알림을 보내 일기 작성을 유도**하고, 작성된 일기를 기반으로 **AI가 긍정적인 시각으로 재해석해 주는 개인 감정 케어 앱**이다. 사용자가 스스로를 돌보고 작은 감정 변화를 기록하며 하루를 따뜻하게 정리할 수 있는 개인 감정 케어 서비스를 목표로 한다.

## 2. 앱 테마 및 퍼블리싱 가이드

### 2.1. 전체 톤 & 무드

**부드러움, 편안함, 감성, 부담 없는 기록 경험**을 중심으로 구성한다. 일상 속 작은 휴식 공간처럼 느껴지는 분위기가 핵심이다.

*   과한 그래픽 요소보다는 **심플한 구성과 여백**이 주는 안정감을 강조한다.
*   정보 전달 UI는 단순하게, 감성적 요소는 텍스트와 미세한 컬러 차이로 부드럽게 표현한다.
*   인터랙션은 과한 애니메이션 대신 **부드러운 Fade, Slide 효과**를 최소한으로 사용한다.

### 2.2. 시그니처 컬러 및 폰트

기존 제안된 내용을 따르며, 개발 시 `src/styles` 또는 `src/theme` 디렉토리에 `colors.ts`, `fonts.ts` 등으로 스타일 코드를 중앙 관리한다.

*   **기본 컬러 팔레트 (Theme 1: Soft Blue)**:
    *   Signature Soft Blue: `#AFCBFF`
    *   Warm Beige: `#F6E9D7`
    *   Pastel Mint: `#CDEFEA`
    *   Text: `#333333`
    *   Background: `#FAFAFA`

*   **대안 컬러 팔레트 (Theme 2: Dusty Rose)**:
    *   Dusty Rose: `#DABFDE` (메인 컬러)
    *   Warm Sand: `#EADDCD` (보조 컬러)
    *   Muted Teal: `#A1C1C4` (포인트 컬러)
    *   Charcoal Gray: `#4B4F54` (텍스트 컬러)
    *   Off-White: `#F9F7F3` (배경 컬러)

*   **폰트**:
    *   본문: `Pretendard`
    *   UI 요소: `SUIT`
    *   포인트: `Cafe24 Oneprettynight`

---

## 3. 화면 및 기능 명세

### 3.1. 네비게이션 구조 (React Navigation)

- **AppNavigator (Root)**
  - `AuthLoadingScreen`: 앱 실행 시 토큰 유효성 검사 후 스택 이동
  - **AuthStack (인증)**
    - `LoginScreen`: 로그인
    - `RegisterScreen`: 회원가입
  - **MainTab (메인)**
    - `HomeScreen`: 오늘 일기 작성 유도 및 최신 일기 표시
    - `CalendarScreen`: 월별 캘린더 뷰
    - `SettingsScreen`: 설정
  - **DiaryStack (일기 관련)** (Modal로 동작)
    - `DiaryWriteScreen`: 일기 작성/수정
    - `DiaryDetailScreen`: 특정 일기 상세 보기 (원본 + AI 해석)

### 3.2. 화면별 상세 명세

#### 1) AuthLoadingScreen
- **역할**: 로컬 저장소(AsyncStorage)의 JWT 토큰 확인
- **기능**:
  - 토큰 유효 시 → `MainTab`으로 이동
  - 토큰 무효/없음 시 → `AuthStack`으로 이동

#### 2) LoginScreen / RegisterScreen
- **역할**: 사용자 인증
- **컴포넌트**:
  - `AuthTitle`: "LightLog" 로고 또는 타이틀
  - `EmailInput`, `PasswordInput`
  - `PrimaryButton`: "로그인" / "회원가입"
  - `SecondaryButton`: "계정이 없으신가요?" / "로그인으로 돌아가기"

#### 3) HomeScreen (MainTab)
- **역할**: 앱의 메인 랜딩, 일기 작성 유도
- **컴포넌트**:
  - `Header`: "LightLog"
  - `DateDisplay`: "YYYY년 MM월 DD일"
  - `WelcomeMessage`: "오늘 하루는 어땠나요? 가볍게 기록해봐요."
  - `DiaryCard`: 오늘 작성한 일기가 있다면 표시 (없으면 "오늘의 일기를 작성해보세요" 메시지)
  - `FloatingActionButton`: 일기 작성 화면(`DiaryWriteScreen`)으로 이동

#### 4) CalendarScreen (MainTab)
- **역할**: 월별 일기 기록 조회
- **컴포넌트**:
  - `Header`: "돌아보기"
  - `CalendarView`: 일기가 작성된 날짜에 점(dot) 또는 다른 시각적 표시
  - `DiaryPreviewList`: 특정 날짜 선택 시 하단에 해당 일기 요약 표시
  - 날짜 선택 시 `DiaryDetailScreen`으로 이동

#### 5) SettingsScreen (MainTab)
- **역할**: 앱 설정
- **컴포넌트**:
  - `Header`: "설정"
  - `SettingItem`: "알림 설정", "로그아웃", "회원 탈퇴" 등 메뉴 리스트
  - `ToggleSwitch`: 알림 ON/OFF

#### 6) DiaryWriteScreen (Modal)
- **역할**: 일기 작성 및 수정
- **컴포넌트**:
  - `Header`: "기록하기" (저장 버튼 포함)
  - `DateDisplay`: 작성 날짜
  - `MoodSelector`: 오늘 기분을 나타내는 이모지/슬라이더
  - `TextInput`: 여러 줄 입력 가능한 일기 입력창
  - `AIAnalyzeButton`: "AI에게 위로받기" 버튼 (저장 후 실행)

#### 7) DiaryDetailScreen
- **역할**: 특정 일기 상세 조회
- **컴포넌트**:
  - `Header`: "YYYY년 MM월 DD일의 기록"
  - `OriginalDiaryView`: 사용자가 작성한 원본 일기
  - `AIDiaryView`: AI가 재해석한 긍정 버전 (카드 형태, 다른 배경색 적용)
  - `AIFeedback`: AI의 짧은 감정 피드백

---

## 4. 컴포넌트 아키텍처

- `src/components` 디렉토리 하위에 기능별로 컴포넌트를 분리한다.
- **`common/`**: 앱 전반에서 사용되는 원자 단위 컴포넌트
  - `Button.tsx`, `Input.tsx`, `Card.tsx`, `Header.tsx`, `Icon.tsx`
- **`diary/`**: 일기 관련 복합 컴포넌트
  - `DiaryCard.tsx`, `MoodSelector.tsx`
- **`calendar/`**: 캘린더 관련 컴포넌트
  - `CalendarView.tsx`

---

## 5. 상태 관리 (Zustand)

`src/stores` 디렉토리에서 상태 로직을 중앙 관리한다.

### 5.1. `authStore`
- **state**: `isLoggedIn`, `accessToken`, `userProfile`
- **actions**: `login()`, `logout()`, `register()`, `loadToken()`

### 5.2. `diaryStore`
- **state**: `diaries` (월별 또는 전체 목록), `selectedDiary`
- **actions**: `fetchDiaries()`, `createDiary()`, `updateDiary()`, `deleteDiary()`, `analyzeDiary()`

### 5.3. `uiStore`
- **state**: `isLoading`, `error`, `isAILoading`
- **actions**: `setLoading()`, `setError()`

---

## 6. API 클라이언트

`src/lib/api` 또는 `src/services` 디렉토리에서 API 연동 로직을 관리한다.

- `axios` 라이브러리 사용
- **API Client Instance 생성**:
  - `baseURL` 설정
  - `interceptors`를 사용해 요청 시 `Authorization` 헤더에 `accessToken` 자동 추가
  - 응답 `interceptor`에서 401 에러 발생 시 토큰 갱신 또는 로그아웃 처리
- **API 함수**: `diaryStore`와 연동될 API 호출 함수 정의
  - `login(email, password)`
  - `getDiaries(year, month)`
  - `postDiary(content, mood)`
  - `getAnalyzedDiary(diaryId)`

이 기획서를 바탕으로 `LightLog_FE` 프로젝트의 초기 구조를 설정하고 MVP 개발을 시작한다.

