# 서버 개선사항 정리

> 분석일: 2026-03-20
> 대상: 명장쇼핑몰 NestJS 서버
> 마지막 수정: 2026-03-20

---

## 목차

1. [보안 (Security)](#보안)
2. [아키텍처 (Architecture)](#아키텍처)
3. [코드 품질 (Code Quality)](#코드-품질)
4. [운영/안정성 (Operations)](#운영안정성)

---

## 보안

---

### [SEC-01] JWT Secret 기본값 노출 🔴 CRITICAL

- [x] **완료**

**문제**
`auth.module.ts`에서 `JWT_SECRET` 환경변수가 설정되지 않았을 때 `'your-secret-key-change-in-production'`이라는 하드코딩된 기본값이 사용됨.
환경변수 누락 상태로 배포하면 약한 키로 JWT가 서명되어 토큰 위조 공격에 노출됨.

**현재 코드 위치**
`src/auth/auth.module.ts` — `JwtModule.registerAsync` 내부 `secret` 설정

**해결 방향**
- 기본값 제거
- 환경변수 미설정 시 앱 시작을 즉시 중단시키는 예외 처리 추가

**변경 파일**
- `src/auth/auth.module.ts` — 기본값 제거, `JWT_SECRET` 미설정 시 `Error` throw

---

### [SEC-02] 관리자 권한 검증 없음 🔴 HIGH

- [x] **완료**

**문제**
상품 생성(`POST /products`), 수정(`PATCH /products/:id`), 삭제(`DELETE /products/:id`) 등 관리자 전용 엔드포인트에 `JwtAuthGuard`만 적용되어 있음.
로그인한 일반 사용자도 상품을 생성/수정/삭제할 수 있는 상태.
브랜드, 카테고리 등 다른 관리 엔드포인트도 동일한 문제.

**현재 코드 위치**
`src/products/products.controller.ts`, `src/brands/brands.controller.ts`, `src/categories/categories.controller.ts`

**해결 방향**
- `RolesGuard` 구현 (`src/auth/guards/roles.guard.ts`)
- `@Roles()` 커스텀 데코레이터 구현 (`src/auth/decorators/roles.decorator.ts`)
- 관리자 전용 엔드포인트에 `@Roles(UserRole.ADMIN)` + `RolesGuard` 적용

**변경 파일**
- `src/auth/guards/roles.guard.ts` — 신규 생성
- `src/auth/decorators/roles.decorator.ts` — 신규 생성
- `src/products/products.controller.ts` — POST, PATCH, DELETE에 `@Roles(ADMIN)` 적용
- `src/brands/brands.controller.ts` — POST, PATCH, DELETE에 `@Roles(ADMIN)` 적용
- `src/categories/categories.controller.ts` — POST, PATCH, DELETE에 `@Roles(ADMIN)` 적용

---

### [SEC-03] Rate Limiting 없음 🔴 HIGH

- [x] **완료**

**문제**
로그인(`POST /auth/login`), 회원가입(`POST /auth/register`) 등 인증 엔드포인트에 요청 횟수 제한이 없음.
브루트포스 공격, 자격증명 스터핑 공격에 무방비 상태.

**현재 코드 위치**
`src/auth/auth.controller.ts`

**해결 방향**
- `@nestjs/throttler` 패키지 도입
- 인증 엔드포인트에 단기 제한 적용 (예: 1분에 10회)
- 전역 기본 제한 설정 후 민감 엔드포인트는 별도 오버라이드

**변경 파일**
- `src/app.module.ts` — `ThrottlerModule` 전역 등록 (1분 100회 기본 제한), `APP_GUARD`로 `ThrottlerGuard` 글로벌 적용
- `src/auth/auth.controller.ts` — `register` 1분 5회, `login` 1분 10회 제한

---

### [SEC-04] HTTP 보안 헤더 미적용 (Helmet) 🟡 MEDIUM

- [x] **완료**

**문제**
`main.ts`에 Helmet이 적용되어 있지 않아 기본적인 HTTP 보안 헤더가 누락됨.
XSS, Clickjacking, MIME 타입 스니핑 등의 공격에 대한 브라우저 수준 방어가 없음.

**현재 코드 위치**
`src/main.ts`

**해결 방향**
- `helmet` 패키지 설치 및 `app.use(helmet())` 적용
- 정적 파일 서빙과 충돌하지 않도록 Content-Security-Policy 설정 주의

**변경 파일**
- `src/main.ts` — `app.use(helmet(...))` 적용, `crossOriginResourcePolicy: cross-origin`으로 정적 파일 호환성 유지

---

### [SEC-05] 비밀번호 정책 미흡 🟡 MEDIUM

- [x] **완료**

**문제**
회원가입 DTO에서 비밀번호 최소 길이만 6자로 검증함.
대소문자, 숫자, 특수문자 조합 요구 없음.

**현재 코드 위치**
`src/auth/dto/` 내 회원가입 관련 DTO

**해결 방향**
- 최소 8자 이상
- 대문자, 소문자, 숫자, 특수문자 각 1개 이상 포함 정규식 검증 추가
- `@Matches()` 데코레이터 활용

**변경 파일**
- `src/auth/dto/register.dto.ts` — 최소 8자, 대/소문자/숫자/특수문자 조합 정규식 추가

---

## 아키텍처

---

### [ARCH-01] synchronize: true — 프로덕션 데이터 손실 위험 🔴 CRITICAL

- [x] **완료**

**문제**
`app.module.ts`의 TypeORM 설정에서 `synchronize: true`가 환경 구분 없이 적용됨.
프로덕션 환경에서 이 옵션이 활성화되면 엔티티 변경 시 테이블을 자동으로 변경/삭제할 수 있어 **데이터 손실**이 발생할 수 있음.

**현재 코드 위치**
`src/app.module.ts` — `TypeOrmModule.forRootAsync` 내 `synchronize` 설정

**해결 방향**
- `synchronize: process.env.NODE_ENV !== 'production'`으로 환경별 분기
- 장기적으로 TypeORM 마이그레이션(`migration:generate`, `migration:run`) 도입
- `typeorm-extension` 또는 NestJS 내장 마이그레이션 활용

**변경 파일**
- `src/app.module.ts` — `synchronize: configService.get('NODE_ENV') !== 'production'`으로 변경

---

### [ARCH-02] Repository 레이어 분리 부재 🟡 MEDIUM

- [ ] **미완료**

**문제**
각 서비스에서 `@InjectRepository(Entity)`로 TypeORM Repository를 직접 주입받아 사용함.
비즈니스 로직과 데이터 접근 로직이 Service에 혼재되어 있음.
단위 테스트 시 TypeORM Mock을 직접 구성해야 하는 불편함 발생.

**현재 코드 위치**
`src/products/products.service.ts`, `src/auth/auth.service.ts` 등 전체 서비스 파일

**해결 방향**
- 각 모듈에 `<module>.repository.ts` 파일 추가 (`src/products/repositories/products.repository.ts`)
- 데이터 접근 메서드를 커스텀 Repository로 이동 (`findByIdOrFail`, `findAllWithFilters` 등)
- Service는 커스텀 Repository만 의존하도록 변경
- 테스트 시 커스텀 Repository만 Mock하면 됨

> 전체 서비스 파일 리팩토링이 필요한 대규모 작업으로 별도 스프린트에서 진행 예정

---

### [ARCH-03] 글로벌 예외 필터 없음 🔴 HIGH

- [x] **완료**

**문제**
전역 `ExceptionFilter`가 없어 에러 응답 포맷이 NestJS 기본값으로 반환됨.
예외 상황의 로깅이 서비스 레이어에서 일관성 없이 처리됨.
성공 응답과 실패 응답의 포맷이 달라 프론트엔드에서 일관된 파싱이 어려움.

**현재 코드 위치**
`src/main.ts` (글로벌 필터 등록 위치)

**해결 방향**
- `src/common/filters/http-exception.filter.ts` 구현
- 모든 에러 응답을 통일된 포맷으로 변환:
  ```
  { success: false, statusCode, message, path, timestamp }
  ```
- `main.ts`에 `app.useGlobalFilters(new HttpExceptionFilter())` 등록

**변경 파일**
- `src/common/filters/http-exception.filter.ts` — 신규 생성
- `src/main.ts` — `app.useGlobalFilters` 등록

---

### [ARCH-04] API 응답 인터셉터 없음 🟡 MEDIUM

- [x] **완료**

**문제**
성공 응답 형태가 모듈마다 다름. 일부는 DTO 객체 직접 반환, 일부는 배열, 일부는 페이지네이션 객체.
프론트엔드에서 응답마다 다른 파싱 로직이 필요.

**현재 코드 위치**
각 컨트롤러의 반환값 — 통일된 래핑 없음

**해결 방향**
- `src/common/interceptors/transform.interceptor.ts` 구현
- 모든 성공 응답을 통일된 포맷으로 래핑:
  ```
  { success: true, data: <payload>, timestamp }
  ```
- `main.ts`에 `app.useGlobalInterceptors(new TransformInterceptor())` 등록

**변경 파일**
- `src/common/interceptors/transform.interceptor.ts` — 신규 생성
- `src/main.ts` — `app.useGlobalInterceptors` 등록

---

### [ARCH-05] Payments 모듈 미구현 🔴 HIGH

- [x] **완료**

**문제**
`Payment` 엔티티와 관계 설정은 완료되어 있으나 컨트롤러, 서비스, DTO가 전혀 없음.
주문 생성 이후 결제 처리 흐름이 완결되지 않은 상태.

**현재 코드 위치**
`src/payments/` — 엔티티 파일만 존재

**해결 방향**
- `payments.controller.ts`, `payments.service.ts`, `payments.module.ts` 구현
- 결제 생성, 조회, 상태 업데이트 API 설계
- PG사 연동 또는 모의 결제 처리 흐름 구현
- 주문 상태와 결제 상태를 연동하는 비즈니스 로직 추가

**변경 파일**
- `src/payments/enums/payment-method.enum.ts` — 신규 생성 (CARD, BANK_TRANSFER, KAKAO_PAY 등)
- `src/payments/dto/create-payment.dto.ts` — 신규 생성
- `src/payments/dto/payment-response.dto.ts` — 신규 생성
- `src/payments/payments.service.ts` — 신규 생성 (생성, 완료, 환불, 조회)
- `src/payments/payments.controller.ts` — 신규 생성
- `src/payments/payments.module.ts` — 신규 생성
- `src/payments/entities/payment.entity.ts` — `PaymentStatus`에 `REFUNDED` 추가, `paymentMethod` enum 타입으로 변경
- `src/app.module.ts` — `PaymentsModule` 등록

---

## 코드 품질

---

### [QUAL-01] 환경변수 유효성 검증 없음 🟡 MEDIUM

- [x] **완료**

**문제**
앱 시작 시 필수 환경변수(`DB_HOST`, `JWT_SECRET`, `DB_PASSWORD` 등)가 누락되어도 실행됨.
누락된 환경변수로 인한 런타임 오류가 앱 시작 후 특정 기능 사용 시점에야 발생함.

**현재 코드 위치**
`src/app.module.ts` — `ConfigModule.forRoot()` 설정

**해결 방향**
- `joi` 패키지로 환경변수 스키마 검증 추가
- `ConfigModule.forRoot({ validationSchema: ... })` 설정
- 앱 시작 시 필수값 누락이면 즉시 에러와 함께 프로세스 종료

**변경 파일**
- `src/app.module.ts` — `Joi.object()` 스키마로 모든 필수 환경변수 검증 추가

---

### [QUAL-02] TypeScript strict 모드 비활성화 🟢 LOW

- [ ] **미완료**

**문제**
`tsconfig.json`에서 `strictNullChecks: false`, `noImplicitAny: false`로 설정됨.
null/undefined 관련 런타임 오류가 컴파일 타임에 감지되지 않음.
`any` 타입 남용으로 타입 안전성이 낮음.

**현재 코드 위치**
`tsconfig.json`

**해결 방향**
- 단계적으로 `strictNullChecks: true` 활성화 (파일 단위로 수정하면서 적용)
- 장기적으로 `strict: true` 전환 목표
- 현재는 의도적 설정이므로 팀 합의 후 진행

> 전체 코드베이스 타입 수정이 필요한 대규모 작업. 팀 합의 후 별도 진행

의견 : 단계적인 방향으로만 진행해줘

---

### [QUAL-03] Swagger API 문서화 없음 🟡 MEDIUM

- [x] **완료**

**문제**
API 문서가 없어 프론트엔드 팀이나 외부 연동 시 엔드포인트, 요청/응답 스키마를 코드에서 직접 확인해야 함.
DTO 변경 시 문서와의 불일치 발생 가능.

**현재 코드 위치**
`src/main.ts`, 각 컨트롤러 및 DTO 파일

**해결 방향**
- `@nestjs/swagger` 패키지 설치
- `main.ts`에 SwaggerModule 설정 (`/api-docs` 경로로 UI 제공)
- 각 DTO에 `@ApiProperty()` 데코레이터 추가 (별도 작업)
- 컨트롤러에 `@ApiTags()`, `@ApiOperation()` 추가 (별도 작업)

**변경 파일**
- `src/main.ts` — `SwaggerModule.setup('api-docs', ...)` 설정, 개발 환경에서만 활성화
- 접속 URL: `http://localhost:3500/api-docs`

---

## 운영/안정성

---

### [OPS-01] 구조화 로깅 없음 🟢 LOW

- [ ] **미완료**

**문제**
현재 NestJS 기본 Logger 또는 `console.log`만 사용.
프로덕션 환경에서 로그 레벨 제어, 외부 로그 수집(ELK, CloudWatch 등)이 어려움.
요청 추적(Request ID), 에러 스택 트레이스 구조화가 안 됨.

**현재 코드 위치**
전체 서비스 파일 — 비체계적 로깅

**해결 방향**
- `winston` + `nest-winston` 패키지 도입
- 로그 레벨(error, warn, info, debug)별 출력 제어
- 개발 환경: 컬러 콘솔 출력 / 프로덕션: JSON 구조화 출력
- 요청마다 고유 ID 부여하는 로깅 미들웨어 추가

---

### [OPS-02] 헬스체크 엔드포인트 없음 🟢 LOW

- [x] **완료**

**문제**
배포 환경(Docker, Kubernetes, PM2 등)에서 서버 상태를 확인할 엔드포인트가 없음.
DB 연결 상태, 메모리 등을 외부에서 모니터링 불가.

**해결 방향**
- `@nestjs/terminus` 패키지 도입
- `GET /health` 엔드포인트 구현
- DB 연결 상태, 메모리 사용량 체크 포함

**변경 파일**
- `src/health/health.controller.ts` — 신규 생성 (`GET /health`, DB ping 체크)
- `src/health/health.module.ts` — 신규 생성
- `src/app.module.ts` — `HealthModule` 등록

---

## 개선 우선순위 로드맵

### Phase 1 — 즉시 처리 (배포 전 필수)
| ID | 항목 | 상태 |
|----|------|------|
| SEC-01 | JWT Secret 기본값 제거 | ✅ 완료 |
| ARCH-01 | synchronize 환경별 분기 | ✅ 완료 |
| SEC-02 | RolesGuard 구현 및 적용 | ✅ 완료 |
| SEC-03 | Rate Limiting 적용 | ✅ 완료 |
| ARCH-03 | 글로벌 ExceptionFilter | ✅ 완료 |
| ARCH-05 | Payments 모듈 구현 | ✅ 완료 |

### Phase 2 — 품질 개선 (배포 후 순차 적용)
| ID | 항목 | 상태 |
|----|------|------|
| SEC-04 | Helmet 적용 | ✅ 완료 |
| SEC-05 | 비밀번호 정책 강화 | ✅ 완료 |
| ARCH-02 | Repository 레이어 분리 | ⏳ 미완료 |
| ARCH-04 | API 응답 인터셉터 | ✅ 완료 |
| QUAL-01 | 환경변수 Joi 검증 | ✅ 완료 |
| QUAL-03 | Swagger 문서화 | ✅ 완료 |

### Phase 3 — 장기 개선
| ID | 항목 | 상태 |
|----|------|------|
| QUAL-02 | TypeScript strict 모드 전환 | ⏳ 미완료 |
| OPS-01 | 구조화 로깅 (Winston) | ⏳ 미완료 |
| OPS-02 | 헬스체크 엔드포인트 | ✅ 완료 |
