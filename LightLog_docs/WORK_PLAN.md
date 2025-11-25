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

## Phase 3: 프론트엔드-백엔드 연동 (진행 중)

- [x] ~~프론트엔드: `axios`를 이용한 API 클라이언트 설정~~
- [x] ~~프론트엔드: `Zustand`를 이용한 전역 상태 관리 (인증 토큰, 사용자 정보)~~
- [x] ~~회원가입/로그인 화면 UI 구현~~
- [x] ~~회원가입/로그인 기능 연동 (API 호출, JWT 토큰 저장/관리)~~
- [x] ~~아이디/닉네임 중복 체크 기능 구현~~
- [x] ~~비밀번호 보기 토글 기능 추가~~
- [ ] 로그인/회원가입 프로세스 UX 고도화
  - [ ] 회원가입 완료 후 적절한 피드백 및 화면 전환 개선
  - [ ] 로그인 실패 시 에러 메시지 개선
  - [ ] 폼 검증 UX 개선 (실시간 검증 vs 제출 시 검증)
- [ ] 인증 화면 스타일 개선
  - [ ] 일관된 디자인 시스템 적용
  - [ ] 반응형 레이아웃 개선
  - [ ] 접근성(Accessibility) 고려
- [x] ~~메인 화면과 백엔드 연동~~
  - [x] ~~앱 실행 시, 실제 '어제 일기' 데이터 조회 API 호출~~
  - [ ] 온보딩 모달에서 '하루 요약 보기' 선택 시, 백엔드에 요약 요청 API 호출 (AI 기능 필요)

---

## Phase 4: 핵심 AI 기능 구현

- [ ] 백엔드: `ModerationService` 구현 (사용자 입력 유해성 검사)
  - [ ] Google Perspective API 또는 OpenAI Moderation API 연동
- [ ] 백엔드: `AIService` 구현 (Google Gemini API 연동)
  - [ ] 프롬프트 엔지니어링을 통해 서비스 톤앤매너에 맞는 결과물 생성 로직 구현
- [ ] 백엔드: AI 요약 API 구현
  - [ ] 체크리스트 기반 요약 API
  - [ ] 전체 일기 기반 긍정 재해석 API
- [ ] 프론트엔드: `YesterdaySummaryModal`, `DiaryWriteScreen`과 AI 기능 연동

---

## Phase 5: 기능 완성 및 고도화

- [ ] `CalendarScreen`: 캘린더 UI 및 데이터 연동 기능 전체 구현
- [ ] `SettingsScreen`: 설정 화면 UI 및 기능 구현 (로그아웃 등)
- [ ] 푸시 알림 기능 구현 (서버 및 클라이언트)
- [ ] 전체 UI/UX 최종 검토 및 개선
- [ ] 테스트 (단위, 통합, E2E)
- [ ] 배포 준비

이 계획에 따라 **Phase 2: 백엔드 핵심 기능 구현**부터 진행하는 것을 제안합니다.
