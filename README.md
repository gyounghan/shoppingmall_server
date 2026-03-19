# 명장쇼핑몰 서버

NestJS 기반의 해양용품 쇼핑몰 백엔드 서버입니다.

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. JWT 및 인증 관련 패키지 설치

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install --save-dev @types/passport-jwt @types/bcrypt
```

또는 스크립트 실행:
```bash
chmod +x package-install.sh
./package-install.sh
```

### 3. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Database
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=marine_shop

# Server
PORT=3300
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# JWT
JWT_SECRET=your-secret-key-change-in-production
```

### 4. 데이터베이스 생성

MySQL에서 데이터베이스를 생성하세요:

```sql
CREATE DATABASE marine_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. 서버 실행

개발 모드:
```bash
npm run start:dev
```

프로덕션 빌드:
```bash
npm run build
npm run start:prod
```

## 주요 기능

### 엔티티
- **User**: 사용자 정보
- **Product**: 제품 정보
- **ProductImage**: 제품 이미지 (다중 이미지 지원)
- **ProductOption**: 제품 옵션 (예: 12인치, 16인치)
- **RelatedProduct**: 연관 상품 (이미지 송수파기, 헤딩센서, 안테나)
- **Category**: 카테고리
- **CartItem**: 장바구니 아이템
- **WishlistItem**: 찜 목록 아이템
- **Brand**: 브랜드

### API 모듈
- **Auth**: 회원가입, 로그인, JWT 인증
- **Products**: 제품 조회, 상세 정보 (이미지, 옵션, 연관상품 포함)
- **Brands**: 브랜드 조회
- **Categories**: 카테고리 조회
- **Cart**: 장바구니 관리 (인증 필요)
- **Wishlist**: 찜 목록 관리 (인증 필요)

## API 문서

자세한 API 문서는 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)를 참조하세요.

## 개발 가이드

### 데이터베이스 마이그레이션

개발 환경에서는 `synchronize: true`로 설정되어 있어 엔티티 변경 시 자동으로 테이블이 생성/수정됩니다.

프로덕션 환경에서는 반드시 `synchronize: false`로 설정하고 TypeORM 마이그레이션을 사용하세요.

### 코드 스타일

```bash
# 포맷팅
npm run format

# 린팅
npm run lint
```

## 문제 해결

### JWT 관련 오류
- `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt` 패키지가 설치되어 있는지 확인하세요.

### 데이터베이스 연결 오류
- `.env` 파일의 데이터베이스 설정이 올바른지 확인하세요.
- MySQL 서버가 실행 중인지 확인하세요.

### CORS 오류
- `.env` 파일의 `CORS_ORIGIN`이 클라이언트 URL과 일치하는지 확인하세요.
