# LightLog Backend

Spring Boot 기반의 LightLog 백엔드 API 서버입니다.

## 🚀 시작하기

### 1. 의존성 설치
```bash
./gradlew build
```

### 2. 환경 설정
보안이 필요한 설정을 위해 `application-secret.properties` 파일을 생성해야 합니다:

```bash
# 예제 파일을 복사하여 실제 설정 파일 생성
cp application-secret.properties.example src/main/resources/application-secret.properties
```

`src/main/resources/application-secret.properties` 파일을 열어 다음 값들을 설정하세요:

```properties
# JWT 보안키 (실제 운영 환경에서는 강력한 키 사용)
jwt.secret=your-super-secret-jwt-key-here-make-it-long-and-secure

# OpenAI API 키 (https://platform.openai.com에서 발급)
openai.api-key=sk-your-openai-api-key-here
```

### 4. AI 프롬프트 커스터마이징 (선택사항)
`application-secret.properties` 파일에서 AI 응답의 톤앤매너를 조정할 수 있습니다:

- `openai.prompts.system`: AI의 전반적인 역할과 성격 설정
- `openai.prompts.checklist-summary`: 체크리스트 기반 하루 요약 스타일
- `openai.prompts.positive-reinterpretation`: 긍정적 재해석 방식

예를 들어, 더 전문적인 톤을 원한다면 시스템 프롬프트를 수정하시면 됩니다.

### 3. 서버 실행
```bash
./gradlew bootRun
```

서버는 `http://localhost:8080`에서 실행됩니다.

## 🔧 주요 기능

### 인증 & 사용자 관리
- JWT 기반 사용자 인증
- 회원가입, 로그인, 로그아웃
- 아이디/닉네임 중복 체크

### 일기 관리
- 일기 작성, 수정, 조회
- 날짜별 일기 관리
- 과거 같은 날짜 일기 조회
- 일기 검색 (키워드, 날짜 범위)
- 일기 통계 (연속 기록, 월별 통계)

### AI 기능
- **OpenAI Moderation**: 유해 콘텐츠 자동 검사
- **ChatGPT 기반 요약**: 활동 목록을 바탕으로 하루 요약 생성
- **긍정적 재해석**: 일기 내용을 AI가 긍정적으로 재해석

### 데이터 관리
- 데이터 백업/복원 (JSON 형태)
- 사용자별 데이터 격리

## 📊 API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/check-username` - 아이디 중복 체크
- `GET /api/auth/check-nickname` - 닉네임 중복 체크

### 일기
- `POST /api/diaries` - 일기 작성
- `PUT /api/diaries/{id}` - 일기 수정
- `GET /api/diaries` - 날짜별 일기 조회
- `GET /api/diaries/past` - 과거 같은 날짜 일기들 조회
- `GET /api/diaries/search` - 일기 검색
- `GET /api/diaries/statistics` - 일기 통계

### AI 기능
- `POST /api/diaries/summary` - AI 기반 하루 요약 생성
- `POST /api/diaries/positive-reinterpretation` - AI 긍정적 재해석

### 데이터 관리
- `GET /api/diaries/export` - 데이터 백업
- `POST /api/diaries/import` - 데이터 복원

## 🛠 기술 스택

- **언어**: Kotlin
- **프레임워크**: Spring Boot 3.x
- **보안**: Spring Security + JWT
- **데이터베이스**: H2 (개발용), MySQL/PostgreSQL (운영용)
- **ORM**: JPA/Hibernate
- **외부 API**: OpenAI GPT-3.5-turbo, OpenAI Moderation

## 🔒 보안 고려사항

1. **JWT 보안키**: 운영 환경에서는 강력하고 긴 보안키를 사용하세요
2. **OpenAI API 키**: API 키는 절대 코드에 하드코딩하지 말고 환경변수나 설정파일로 관리하세요
3. **데이터베이스**: 운영 환경에서는 적절한 데이터베이스 접근 권한을 설정하세요
4. **HTTPS**: 운영 환경에서는 반드시 HTTPS를 사용하세요

## 🚨 주의사항

- `application-secret.properties` 파일은 절대 버전 관리에 포함하지 마세요
- OpenAI API 사용량을 모니터링하여 비용을 관리하세요
- AI 기능 호출 실패시 적절한 폴백 메시지가 제공됩니다