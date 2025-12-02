# LightLog 코딩 표준 및 구조 규칙

## 백엔드 (Kotlin + Spring Boot)

### 📁 패키지 구조 규칙

#### 1. DTO (Data Transfer Object) 분리 원칙
- **모든 Request/Response 클래스는 `com.lightlog.dto` 패키지에 위치**
- Controller나 Service 클래스 내부에 DTO 클래스를 정의하지 않음
- API 통신용 데이터 클래스는 별도 관리로 가독성과 재사용성 향상

**✅ 올바른 구조:**
```
com.lightlog.dto/
├── UserRegistrationRequest.kt
├── UserLoginRequest.kt  
├── AuthResponse.kt
├── DiaryCreateRequest.kt
├── SummaryRequest.kt
├── SummaryResponse.kt
├── DiaryStatistics.kt
└── ...
```

**❌ 잘못된 구조:**
```kotlin
// Controller 파일 내부에 DTO 정의 (금지)
@RestController
class DiaryController {
    data class SummaryRequest(...)  // ❌
    data class SummaryResponse(...) // ❌
}
```

#### 2. 패키지별 역할 정의

```
com.lightlog/
├── dto/           # 모든 Request/Response 클래스
├── auth/          # 인증 관련 컨트롤러, 서비스
├── diary/         # 일기 관련 컨트롤러, 서비스, 엔티티
├── user/          # 사용자 관련 엔티티, 리포지토리
├── jwt/           # JWT 토큰 관련 클래스
├── config/        # Spring 설정 클래스들
└── ...
```

### 📋 네이밍 컨벤션

#### DTO 클래스 네이밍
- **Request 클래스**: `{기능명}Request` (예: `UserRegistrationRequest`)
- **Response 클래스**: `{기능명}Response` (예: `AuthResponse`)
- **데이터 클래스**: 명확한 도메인 명 (예: `DiaryStatistics`)

#### 파일명과 클래스명 일치
- 파일명과 클래스명은 항상 일치해야 함
- 한 파일에는 하나의 주요 public 클래스만 정의

### 🔄 Import 관리
- DTO 사용 시 명시적 import 필수
- `import com.lightlog.dto.*` 형태의 와일드카드 import 지양
- 사용하는 DTO만 개별적으로 import

**예시:**
```kotlin
import com.lightlog.dto.UserRegistrationRequest
import com.lightlog.dto.AuthResponse
import com.lightlog.dto.UserLoginRequest
```

---

## 프론트엔드 (React Native + TypeScript)

### 📁 컴포넌트 구조 규칙

```
src/
├── components/
│   ├── screens/       # 화면 컴포넌트
│   ├── common/        # 공통 컴포넌트
│   └── ...
├── services/          # API 서비스 레이어
├── types/             # TypeScript 타입 정의
├── theme/             # 디자인 시스템
└── ...
```

### 🎯 개발 규칙 요약

1. **DTO 분리**: 백엔드의 모든 Request/Response 클래스는 `dto` 패키지에 위치
2. **단일 책임**: 각 클래스와 파일은 명확한 단일 책임을 가짐
3. **명시적 Import**: 필요한 클래스만 개별적으로 import
4. **일관된 네이밍**: 패키지별 일관된 네이밍 컨벤션 적용
5. **구조 유지**: 기능별 패키지 분리로 코드 구조 명확성 확보

---

## 📝 추가 규칙

이 문서는 프로젝트 진행에 따라 지속적으로 업데이트되며, 팀 전체가 일관된 코드 품질을 유지하기 위한 가이드라인입니다.

**마지막 업데이트**: 2024-11-30