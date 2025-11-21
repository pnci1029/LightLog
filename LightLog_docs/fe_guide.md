# LightLog 프론트엔드 상세 기획서

**문서 버전: 1.1.0**

## 1. 서비스 개요 및 목표

LightLog는 사용자에게 **매일 감성적인 알림을 보내 일기 작성을 유도**하고, 작성된 일기를 기반으로 **AI가 긍정적인 시각으로 재해석해 주는 개인 감정 케어 앱**이다. 사용자가 스스로를 돌보고 작은 감정 변화를 기록하며 하루를 따뜻하게 정리할 수 있는 개인 감정 케어 서비스를 목표로 한다.

## 2. 앱 테마 및 퍼블리싱 가이드

### 2.1. 전체 톤 & 무드

**부드러움, 편안함, 감성, 부담 없는 기록 경험**을 중심으로 구성한다. 일상 속 작은 휴식 공간처럼 느껴지는 분위기가 핵심이다.

*   과한 그래픽 요소보다는 **심플한 구성과 여백**이 주는 안정감을 강조한다.
*   정보 전달 UI는 단순하게, 감성적 요소는 텍스트와 미세한 컬러 차이로 부드럽게 표현한다.
*   인터랙션은 과한 애니메이션 대신 **부드러운 Fade, Slide 효과**를 최소한으로 사용한다.

### 2.2. 시그니처 컬러 및 폰트

개발 시 `src/styles` 또는 `src/theme` 디렉토리에 `colors.ts`, `fonts.ts` 등으로 스타일 코드를 중앙 관리한다.

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
    *   포인트: `Cafe24Oneprettynight`

---

## 3. 화면 및 기능 명세 (v1.1: 메인 화면 개편)

### 3.1. 네비게이션 구조 (React Navigation)

- **AppNavigator (Root)**
  - `AuthLoadingScreen`: 앱 실행 시 토큰 유효성 검사 후 스택 이동
  - **AuthStack (인증)**
    - `LoginScreen`, `RegisterScreen`
  - **MainTab (메인)**
    - `HomeScreen`: 어제의 AI 요약 또는 온보딩 제공
    - `CalendarScreen`: 월별 캘린더 뷰
    - `SettingsScreen`: 설정
  - **DiaryStack (일기 관련)** (Modal로 동작)
    - `DiaryWriteScreen`: 일기 작성/수정
    - `DiaryDetailScreen`: 특정 일기 상세 보기
  - **YesterdaySummaryModal (온보딩)** (Modal로 동작)
    - 전날 기록이 없을 경우 `HomeScreen` 진입 시 자동으로 실행

### 3.2. 화면별 상세 명세

#### 1) HomeScreen (MainTab)
- **역할**: 어제의 긍정적 경험을 제공하고, 오늘의 기록을 자연스럽게 유도하는 핵심 랜딩 화면.
- **주요 로직**:
  1. 화면 진입 시, 사용자의 전날 일기 데이터 유무를 확인한다.
  2. **데이터가 있는 경우**: 전날 일기를 기반으로 생성된 AI의 긍정적 재해석 결과를 `AIResultView`에 보여준다.
  3. **데이터가 없는 경우 (신규 사용자 포함)**: `YesterdaySummaryModal`을 자동으로 띄워 사용자 온보딩 및 데이터 수집을 진행한다. 모달에서 생성된 요약 결과를 `AIResultView`에 표시한다.
- **컴포넌트**:
  - `Header`: "LightLog"
  - `AIResultView`: 어제의 AI 요약 결과가 표시되는 메인 콘텐츠 영역. 카드 형태의 UI.
  - `FloatingActionButton`: 오늘의 일기 작성 화면(`DiaryWriteScreen`)으로 이동.

#### 2) YesterdaySummaryModal (Modal)
- **역할**: 신규 사용자 또는 전날 기록이 없는 사용자를 위한 온보딩 및 간단한 데이터 수집.
- **기능**: 사용자가 몇 가지 선택만으로 어제 하루를 요약하고, 앱의 핵심 가치를 즉시 체험하게 한다.
- **컴포넌트**:
  - `ModalTitle`: "어제는 어떤 하루였나요?"
  - `Checklist`: 어제 한 일을 나타내는 선택 가능한 키워드 목록. (예: "업무/공부에 집중했어요", "좋은 사람과 대화했어요", "휴식을 취했어요", "사소한 실수를 했어요")
  - `PrimaryButton`: "하루 요약 보기" (선택된 키워드를 서버로 보내 AI 요약 요청)

#### 3) CalendarScreen, SettingsScreen, Diary-related Screens
- 기존 기획과 동일

---

## 4. 컴포넌트 아키텍처

- `src/components` 디렉토리 하위에 기능별로 컴포넌트를 분리한다.
- **`common/`**: `Button.tsx`, `Input.tsx`, `Card.tsx`, `Header.tsx`, `Icon.tsx`
- **`home/`**: 홈 화면 관련 복합 컴포넌트
  - `AIResultView.tsx`: AI 요약 결과를 보여주는 카드 UI
  - `YesterdayChecklist.tsx`: 온보딩 모달 내 선택지 컴포넌트
- **`diary/`**, **`calendar/`**: 기존 기획과 동일

---

## 5. 상태 관리 (Zustand)

`src/stores` 디렉토리에서 상태 로직을 중앙 관리한다.

### 5.1. `authStore`
- 기존 기획과 동일

### 5.2. `diaryStore`
- **state**: `diaries`, `selectedDiary`, `yesterdaySummary` (어제의 AI 요약)
- **actions**: `fetchDiaries()`, `createDiary()`, `...`, `fetchYesterdaySummary()`, `createSummaryFromChecklist()`

### 5.3. `uiStore`
- **state**: `isLoading`, `error`, `showYesterdayModal` (모달 표시 여부)
- **actions**: `setLoading()`, `setError()`, `openYesterdayModal()`, `closeYesterdayModal()`

---

## 6. API 클라이언트

- 기존 `axios` 기반 구조를 유지하며, 신규 API 함수를 추가한다.
- **추가 API 함수**:
  - `getTodaySummary()`: 앱 실행 시 호출. 전날 일기 기반의 AI 요약 요청.
  - `postChecklistSummary(checklist)`: 온보딩 모달에서 선택한 항목들로 요약 요청.

이 기획서를 바탕으로 `LightLog_FE` 프로젝트의 메인 화면 재설계를 시작한다.

