# 명장쇼핑몰 API 문서

## 문서 목록

| 문서 | 용도 |
|------|------|
| [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) | 전체 API 상세 명세 (클라이언트 개발 참고용) |
| [openapi.yaml](./openapi.yaml) | OpenAPI 3.0 스펙 (Postman, Swagger UI, 코드 생성 등) |

## Quick Start

- **Base URL**: `http://localhost:3300` (기본값, PORT 환경 변수로 변경)
- **인증**: JWT 액세스 토큰 (`Authorization: Bearer <accessToken>`)
- **로그인 후** `accessToken`으로 API 호출, 만료 시 `refreshToken`으로 `POST /auth/refresh` 호출

## OpenAPI 활용

- **Postman**: Import → Link → `openapi.yaml` 경로 지정
- **Swagger UI**: [Swagger Editor](https://editor.swagger.io/)에서 `openapi.yaml` 로드
- **코드 생성**: OpenAPI Generator 등으로 클라이언트 SDK 자동 생성 가능
