# 명장쇼핑몰 API 문서

## 설치 방법

### 1. 필요한 패키지 설치

```bash
cd server
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install --save-dev @types/passport-jwt @types/bcrypt
```

또는 스크립트 실행:
```bash
chmod +x package-install.sh
./package-install.sh
```

### 2. 환경 변수 설정

`.env` 파일에 다음 변수들을 추가하세요:

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

## API 엔드포인트

### 인증 (Auth)

#### 회원가입
```
POST /auth/register
Body: {
  email: string,
  password: string,
  name: string,
  phone?: string
}
Response: {
  user: { id, email, name, phone, fishingPoints },
  token: string
}
```

#### 로그인
```
POST /auth/login
Body: {
  email: string,
  password: string
}
Response: {
  user: { id, email, name, phone, fishingPoints },
  token: string
}
```

#### 내 정보 조회
```
GET /auth/me
Headers: Authorization: Bearer {token}
Response: {
  id, email, name, phone, fishingPoints
}
```

#### 로그아웃
```
POST /auth/logout
Headers: Authorization: Bearer {token}
Response: 204 No Content
```

### 제품 (Products)

#### 제품 목록 조회
```
GET /products?page=1&take=20&brandId=&categoryId=&tag=&search=&minPrice=&maxPrice=&minRating=&sortBy=&sortOrder=
Response: {
  data: ProductResponseDto[],
  total: number,
  page: number,
  take: number,
  totalPages: number
}
```

#### 인기 제품 조회
```
GET /products/top?limit=5&sortBy=salesCount
Response: ProductResponseDto[]
```

#### 브랜드별 제품 조회
```
GET /products/brand/:brandId?page=1&take=20
Response: PaginatedProductResponseDto
```

#### 카테고리별 제품 조회
```
GET /products/category/:categoryId?page=1&take=20
Response: PaginatedProductResponseDto
```

#### 제품 상세 조회
```
GET /products/:id
Response: {
  ...ProductResponseDto,
  images: [{ id, url, alt, order }],
  options: [{ id, name, price, stock, order }],
  relatedProducts: [{
    id,
    category: 'transducer' | 'heading-sensor' | 'antenna',
    product: ProductResponseDto,
    order
  }]
}
```

### 브랜드 (Brands)

#### 브랜드 목록 조회
```
GET /brands
Response: BrandResponseDto[]
```

#### 브랜드 상세 조회
```
GET /brands/:idOrSlug
Response: BrandResponseDto
```

### 카테고리 (Categories)

#### 카테고리 목록 조회
```
GET /categories
Response: CategoryResponseDto[]
```

#### 카테고리 상세 조회
```
GET /categories/:id
Response: CategoryResponseDto
```

### 장바구니 (Cart) - 인증 필요

#### 장바구니에 추가
```
POST /cart
Headers: Authorization: Bearer {token}
Body: {
  productId: string,
  optionId?: string,
  quantity: number
}
Response: CartItemResponseDto
```

#### 장바구니 목록 조회
```
GET /cart
Headers: Authorization: Bearer {token}
Response: CartItemResponseDto[]
```

#### 장바구니 아이템 수정
```
PATCH /cart/:itemId
Headers: Authorization: Bearer {token}
Body: {
  quantity: number
}
Response: CartItemResponseDto
```

#### 장바구니 아이템 삭제
```
DELETE /cart/:itemId
Headers: Authorization: Bearer {token}
Response: 204 No Content
```

#### 장바구니 전체 삭제
```
DELETE /cart
Headers: Authorization: Bearer {token}
Response: 204 No Content
```

### 찜 목록 (Wishlist) - 인증 필요

#### 찜 목록에 추가
```
POST /wishlist
Headers: Authorization: Bearer {token}
Body: {
  productId: string
}
Response: WishlistItemResponseDto
```

#### 찜 목록 조회
```
GET /wishlist
Headers: Authorization: Bearer {token}
Response: WishlistItemResponseDto[]
```

#### 찜 목록에서 삭제 (아이템 ID로)
```
DELETE /wishlist/:itemId
Headers: Authorization: Bearer {token}
Response: 204 No Content
```

#### 찜 목록에서 삭제 (제품 ID로)
```
DELETE /wishlist/product/:productId
Headers: Authorization: Bearer {token}
Response: 204 No Content
```

## 데이터베이스 엔티티

### User
- id (UUID)
- email (unique)
- password (hashed)
- name
- phone
- fishingPoints
- isActive
- createdAt, updatedAt

### Product
- id (UUID)
- name
- description
- price
- image (대표 이미지)
- tag (BEST, NEW, SALE)
- brandId
- categoryId
- stock
- discountRate
- rating
- reviewCount
- viewCount
- salesCount
- isActive
- createdAt, updatedAt

### ProductImage
- id (UUID)
- productId
- url
- order
- alt
- createdAt, updatedAt

### ProductOption
- id (UUID)
- productId
- name (예: '12인치', '16인치')
- price (옵션별 추가 가격)
- stock
- order
- isActive
- createdAt, updatedAt

### RelatedProduct
- id (UUID)
- productId (메인 제품)
- relatedProductId (연관 제품)
- category (transducer, heading-sensor, antenna)
- order
- isActive
- createdAt, updatedAt

### CartItem
- id (UUID)
- userId
- productId
- optionId (선택사항)
- quantity
- createdAt, updatedAt

### WishlistItem
- id (UUID)
- userId
- productId
- createdAt, updatedAt
- (userId, productId) unique constraint

### Category
- id (UUID)
- name
- icon
- link
- description
- order
- isActive
- createdAt, updatedAt

## 주의사항

1. JWT 토큰은 7일간 유효합니다.
2. 인증이 필요한 API는 `Authorization: Bearer {token}` 헤더가 필요합니다.
3. 데이터베이스는 MySQL을 사용합니다.
4. 개발 환경에서는 `synchronize: true`로 설정되어 있어 엔티티 변경 시 자동으로 테이블이 생성/수정됩니다.

