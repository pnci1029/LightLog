# LightLog 프로젝트 기획서

## 1. 프로젝트 개요

**LightLog**는 사용자가 매일의 일기를 기록하고, AI를 통해 긍정적인 피드백을 받으며 감정적인 힐링을 돕는 모바일 다이어리 앱입니다. 감성적인 앱 푸시 알림을 통해 꾸준한 기록을 유도하고, 작성된 일기에 대해 AI가 간단한 첨삭과 함께 긍정적인 관점으로 내용을 재해석해주는 것이 핵심입니다.

## 2. 핵심 기능

1.  **일기 작성 및 관리 (CRUD)**
    *   사용자는 매일의 일기를 텍스트로 작성, 조회, 수정, 삭제할 수 있습니다.
    *   캘린더 뷰를 통해 특정 날짜의 일기를 쉽게 찾아볼 수 있습니다.

2.  **AI 기반 일기 분석**
    *   **간단한 첨삭**: 맞춤법이나 어색한 문장을 자연스럽게 교정합니다.
    *   **긍정적 재해석**: 일기 내용이 부정적이거나 우울하더라도, 그 안에서 긍정적인 측면을 발견하거나 위로와 격려를 담은 메시지로 변환하여 보여줍니다.

3.  **감성 푸시 알림**
    *   매일 특정 시간 또는 사용자가 설정한 시간에 감성적인 문구와 함께 일기 작성을 유도하는 푸시 알림을 보냅니다.

4.  **사용자 인증**
    *   안전한 일기 보관을 위해 로그인 및 회원가입 기능을 제공합니다.

## 3. 기술 스택

### 3.1. 클라이언트 (Frontend) - `LightLog_FE`

*   **Framework**: React Native
*   **Language**: TypeScript
*   **상태 관리**: Redux Toolkit 또는 Zustand
*   **UI**: React Native Elements 또는 직접 구현
*   **참고**: React Native에서 TypeScript를 사용하는 것은 코드의 안정성과 유지보수성을 높여주는 최신 개발 트렌드이며, 적극 권장되는 방식입니다.

### 3.2. 백엔드 (Backend) - `LightLog_BE`

*   **Framework**: Spring Boot 또는 Ktor (Kotlin 기반)
*   **Language**: Kotlin
*   **Database**: H2 (초기 개발용), 추후 PostgreSQL 또는 MySQL로 전환
*   **AI/LLM**: OpenAI GPT 시리즈 또는 Google Gemini API 연동

## 4. 프로젝트 구조

최상위 `LightLog` 디렉토리 내에 다음과 같이 프로젝트를 구성합니다.

```
/LightLog
├── LightLog_BE/      # Kotlin, Spring Boot 기반 백엔드 서버
├── LightLog_FE/      # React Native, TypeScript 기반 클라이언트 앱
└── PROJECT_PLAN.md   # 프로젝트 기획 및 문서
```

## 5. 향후 계획 (Roadmap)

1.  **1단계 (현재)**: 기획서 작성 및 기본 디렉토리 구조 생성
2.  **2단계**: 백엔드(`LightLog_BE`) Spring Boot 프로젝트 초기 설정 및 기본 API 설계
3.  **3단계**: 프론트엔드(`LightLog_FE`) React Native 프로젝트 초기 설정
4.  **4단계**: 사용자 인증 기능 개발 (FE/BE 연동)
5.  **5단계**: 일기 CRUD 기능 개발 (FE/BE 연동)
6.  **6단계**: AI 서비스 연동 및 분석 기능 구현
7.  **7단계**: 푸시 알림 기능 구현
8.  **8단계**: 테스트 및 배포
