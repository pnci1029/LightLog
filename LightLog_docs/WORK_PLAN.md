# LightLog 프로젝트 작업 계획서 (WORK_PLAN)

## Phase 1: 프로젝트 기획 및 프론트엔드 프로토타이핑 (완료)

- [x] `LightLog_FE`, `LightLog_BE` 레포지토리 초기화
- [x] `PROJECT_PLAN.md`: 프로젝트 초기 기획
- [x] `fe_guide.md`: 프론트엔드 상세 기획 및 UI/UX 정책 수립
- [x] 프론트엔드 메인 화면 UI 프로토타입 구현
  - [x] 컴포넌트 분리 및 구조화
  - [x] 온보딩 모달(어제 하루 요약) 플로우 및 애니메이션 구현
  - [x] `AsyncStorage`를 이용한 온보딩 완료 상태 영속성 처리

---

## Phase 2: 백엔드 핵심 기능 구현 (완료)

- [x] ~~`LightLog_BE`: Spring Boot, Kotlin, Gradle 프로젝트 초기 설정~~
- [x] ~~Spring Security 및 JWT(JSON Web Token) 라이브러리 추가, 보안 설정 구성~~
- [x] ~~사용자(`User`) 관련 기능 구현~~
  - [x] ~~`User` Entity, `UserRepository` 생성~~
  - [x] ~~`AuthController`, `AuthService` 구현 (회원가입, 로그인 API)~~
- [x] ~~일기(`Diary`) 관련 기능 구현~~
  - [x] ~~`Diary` Entity, `DiaryRepository` 생성~~
  - [x] ~~`DiaryController`, `DiaryService` 구현 (기본적인 CRUD API)~~

---

## Phase 3: 프론트엔드-백엔드 연동 (완료)

- [x] ~~프론트엔드: `axios`를 이용한 API 클라이언트 설정~~
- [x] ~~프론트엔드: `Zustand`를 이용한 전역 상태 관리 (인증 토큰, 사용자 정보)~~
- [x] ~~회원가입/로그인 화면 UI 구현~~
- [x] ~~회원가입/로그인 기능 연동 (API 호출, JWT 토큰 저장/관리)~~
- [x] ~~아이디/닉네임 중복 체크 기능 구현~~
- [x] ~~비밀번호 보기 토글 기능 추가~~
- [x] ~~로그인/회원가입 프로세스 UX 고도화~~
  - [x] ~~회원가입 완료 후 적절한 피드백 및 화면 전환 개선~~
  - [x] ~~로그인 실패 시 에러 메시지 개선~~
  - [x] ~~폼 검증 UX 개선 (실시간 검증 vs 제출 시 검증)~~
- [x] ~~인증 화면 스타일 개선~~
  - [x] ~~일관된 디자인 시스템 적용~~
  - [x] ~~반응형 레이아웃 개선~~
  - [x] ~~접근성(Accessibility) 고려~~
- [x] ~~메인 화면과 백엔드 연동~~
  - [x] ~~앱 실행 시, 실제 '어제 일기' 데이터 조회 API 호출~~
  - [x] ~~온보딩 모달에서 '하루 요약 보기' 선택 시, 백엔드에 요약 요청 API 호출~~

---

## Phase 4: 일기 관리 및 조회 기능 구현 (완료)

### 4.1 일기 작성 기능 (완료)
- [x] `DiaryWriteScreen`: 일기 작성 화면 UI 및 기능 구현
  - [x] 텍스트 입력, 저장, 수정 기능 (하루에 하나의 일기만 작성 가능)
  - [x] 자동으로 기존 일기 불러오기 및 수정 모드 전환
  - [ ] 작성 날짜 선택 기능 (추후 구현 예정)
  - [ ] 임시 저장 기능 (선택사항)

### 4.2 달력 기반 일기 조회 (완료)
- [x] `CalendarScreen`: 달력 UI 및 데이터 연동 기능 구현
  - [x] `react-native-calendars` 라이브러리 사용
  - [x] 일기 작성된 날짜에 점 표시
  - [x] 특정 날짜 클릭 시 해당 일기 조회 및 표시
  - [x] 월/년도 네비게이션 기능
  - [x] 선택된 날짜의 일기 내용 미리보기

### 4.3 과거 일기 빠른 조회 기능 (완료)
- [x] 백엔드: 과거 일기 조회 API 구현
  - [x] 1개월 전 같은 날 일기 조회 API
  - [x] 3개월 전 같은 날 일기 조회 API  
  - [x] 6개월 전 같은 날 일기 조회 API
  - [x] 1년 전 같은 날 일기 조회 API
  - [x] `/api/diaries/past` 엔드포인트로 모든 과거 일기 조회
- [x] 프론트엔드: 과거 일기 조회 UI 구현
  - [x] 메인 화면에 "과거의 오늘" 섹션 추가 (`PastDiariesView` 컴포넌트)
  - [x] 가로 스크롤 카드 형태로 과거 일기 미리보기
  - [x] 과거 일기 상세 보기 모달

### 4.4 네비게이션 및 화면 구조
- [x] ~~하단 탭 네비게이션 구현~~
  - [x] ~~홈, 일기쓰기, 달력, 설정 탭~~
  - [x] ~~React Native Vector Icons 적용 (Ionicons)~~
- [ ] 화면 간 데이터 전달 및 상태 관리

---

## Phase 5: 부가 기능 및 사용자 경험 개선 (완료)

- [x] ~~백엔드 DTO 구조 개선 (별도 패키지 분리)~~
- [x] ~~`SearchScreen`: 일기 검색 화면 UI 구현~~
- [x] ~~`StatisticsScreen`: 일기 통계 화면 UI 구현~~
- [x] ~~`NotificationSettingsScreen`: 푸시 알림 설정 화면 UI 구현~~
- [x] ~~`SettingsScreen`: 설정 화면 UI 및 기능 구현 (로그아웃 등)~~
- [x] ~~백엔드: 일기 검색 API 구현 (`/api/diaries/search`)~~
- [x] ~~백엔드: 일기 통계 API 구현 (`/api/diaries/statistics`)~~
- [x] ~~푸시 알림 기능 구현 (일기 작성 리마인더)~~
- [x] ~~화면 간 데이터 전달 및 상태 관리 (TabNavigator 연동)~~
- [x] ~~데이터 백업/복원 기능~~
  - [x] ~~백엔드: 데이터 export/import API 구현~~
  - [x] ~~프론트엔드: 파일 업로드/다운로드 기능 구현~~
  - [x] ~~SettingsScreen에 백업/복원 UI 연동~~
- [x] ~~전체 UI/UX 최종 검토 및 개선~~
  - [x] ~~테마 시스템 확장 (spacing, typography, shadows)~~
  - [x] ~~공통 컴포넌트 구현 (Button, Card, LoadingOverlay, ErrorMessage, EmptyState)~~
  - [x] ~~일관된 디자인 시스템 적용~~

### 📋 코딩 표준 및 구조 규칙
- [x] ~~`CODING_STANDARDS.md`: DTO 분리 원칙 및 패키지 구조 규칙 문서화~~
- 모든 새로운 코드는 [CODING_STANDARDS.md](./CODING_STANDARDS.md)를 따라야 함

---

## Phase 6: 핵심 AI 기능 구현 (추후)

- [ ] 백엔드: `ModerationService` 구현 (사용자 입력 유해성 검사)
  - [ ] OpenAI Moderation API 연동
- [ ] 백엔드: `AIService` 구현 (ChatGPT API 연동)
  - [ ] 프롬프트 엔지니어링을 통해 서비스 톤앤매너에 맞는 결과물 생성 로직 구현
- [ ] 백엔드: AI 요약 API 구현
  - [ ] 체크리스트 기반 요약 API
  - [ ] 전체 일기 기반 긍정 재해석 API
- [ ] 프론트엔드: `YesterdaySummaryModal`, `DiaryWriteScreen`과 AI 기능 연동

---

## Phase 7: 테스트 및 배포

- [ ] 테스트 (단위, 통합, E2E)
- [ ] 성능 최적화
- [ ] 배포 준비

이 계획에 따라 **Phase 2: 백엔드 핵심 기능 구현**부터 진행하는 것을 제안합니다.
