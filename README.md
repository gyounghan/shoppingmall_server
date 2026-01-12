# 명장쇼핑몰 서버

NestJS 기반 백엔드 서버

## 설치

```bash
npm install
```

## 실행

### 개발 모드
```bash
npm run start:dev
```

### 프로덕션 빌드
```bash
npm run build
npm run start:prod
```

## 시드 데이터

### 브랜드 시드 데이터 생성
```bash
npm run seed:brands
```

이 명령어는 클라이언트에 있는 브랜드 데이터를 서버 DB에 추가합니다.

## 이미지 관리

### 브랜드 로고 이미지
- 이미지 저장 경로: `public/images/brands/`
- 이미지 파일명 형식: `{slug}_logo.png` (예: `lowrance_logo.png`)
- 접근 URL: `http://localhost:3000/images/brands/{slug}_logo.png`

### 이미지 추가 방법
1. `public/images/brands/` 폴더에 이미지 파일 추가
2. 파일명은 브랜드 slug와 일치해야 함 (예: `lowrance_logo.png`)
3. 브랜드 엔티티의 `logo` 필드에 `/images/brands/{slug}_logo.png` 형식으로 저장

## API 엔드포인트

- `GET /` - 기본 메시지
- `GET /health` - 서버 상태 확인
- `GET /brands` - 브랜드 목록 조회
- `GET /brands/:idOrSlug` - 브랜드 상세 조회
- `POST /brands` - 브랜드 생성
- `PATCH /brands/:idOrSlug` - 브랜드 수정
- `DELETE /brands/:idOrSlug` - 브랜드 삭제

## 포트

기본 포트: 3000

## CORS

클라이언트(`http://localhost:5173`)와의 통신을 위해 CORS가 활성화되어 있습니다.

## 데이터베이스

MySQL 데이터베이스를 사용합니다. `.env` 파일에서 설정을 관리합니다.
