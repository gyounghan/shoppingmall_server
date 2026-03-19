# 명장쇼핑몰 API 문서

**버전**: 1.0  
**최종 수정일**: 2025-03-05  
**대상**: 클라이언트 개발자

---

## 1. 개요

### 1.1 기본 정보

| 항목 | 내용 |
|------|------|
| Base URL | `http://localhost:3000` (환경 변수 `PORT`로 변경 가능, 예: `PORT=3300`) |
| 인코딩 | UTF-8 |
| Content-Type | `application/json` |
| 인증 방식 | JWT 액세스 토큰 (Bearer) + 리프레시 토큰 |

**환경 변수 (선택)**  
- `JWT_SECRET`: 서명 비밀키 (기본값 사용 시 프로덕션에서 반드시 변경)
- `JWT_ACCESS_EXPIRES`: 액세스 토큰 만료 (기본 15분, 예: `900` 또는 `15m`)
- `JWT_REFRESH_EXPIRES`: 리프레시 토큰 만료 (기본 7일, 예: `604800` 또는 `7d`)

### 1.2 응답 공통 규칙

- 성공 시: HTTP 상태 코드 2xx, JSON 본문
- 실패 시: JSON 본문에 `message`, `error`, `statusCode` 등 포함
- Validation 실패: `400 Bad Request`, 배열 형태로 필드별 오류 반환

### 1.3 정적 파일

- 경로: `/` (이미지 등)
- 예: `http://localhost:3000/brands/lowrance.png`

---

## 2. 인증 (Authentication)

### 2.1 회원가입

```
POST /auth/register
```

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "phone": "010-1234-5678"
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| email | string | O | 이메일 형식 |
| password | string | O | 최소 6자 |
| name | string | O | - |
| phone | string | X | - |

**Response** `201 Created`

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "role": "USER",
    "fishingPoints": 0
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

| 필드 | 설명 |
|------|------|
| accessToken | API 호출 시 `Authorization: Bearer {accessToken}` 헤더에 사용 (만료: 약 15분) |
| refreshToken | 액세스 토큰 갱신용, `/auth/refresh`로 새 토큰 발급 |
| expiresIn | 액세스 토큰 유효 시간(초) |

---

### 2.2 로그인

```
POST /auth/login
```

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** `200 OK`  
(회원가입과 동일 구조)

---

### 2.3 토큰 갱신 (리프레시)

```
POST /auth/refresh
```

**Request Body**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| 필드 | 타입 | 필수 |
|------|------|------|
| refreshToken | string | O |

**Response** `200 OK`  
(회원가입/로그인과 동일 구조: user, accessToken, refreshToken, expiresIn)

- 리프레시 시 기존 리프레시 토큰은 무효화됨 (토큰 로테이션)

---

### 2.4 내 정보 조회 (인증 필요)

```
GET /auth/me
Authorization: Bearer <accessToken>
```

**Response** `200 OK`

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "role": "USER",
  "fishingPoints": 0
}
```

---

### 2.5 내 정보 수정 (인증 필요)

```
PATCH /auth/me
Authorization: Bearer <accessToken>
```

**Request Body** (모든 필드 선택)

```json
{
  "name": "홍길동",
  "phone": "010-9876-5432"
}
```

| 필드 | 타입 | 제약 |
|------|------|------|
| name | string | 최대 100자 |
| phone | string | 최대 20자 |

**Response** `200 OK`  
(내 정보 조회와 동일 구조)

---

### 2.6 로그아웃 (인증 필요)

```
POST /auth/logout
Authorization: Bearer <accessToken>
```

**Request Body** (선택)

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- `refreshToken` 전달 시: 해당 리프레시 토큰만 서버에서 무효화
- 생략 시: 해당 사용자의 모든 리프레시 토큰 무효화

**Response** `204 No Content`  
- **클라이언트에서 액세스·리프레시 토큰을 삭제해야 함.**

---

## 3. 공통 엔드포인트

### 3.1 헬스체크

```
GET /
GET /health
```

**Response** `200 OK`

```json
{
  "status": "ok",
  "message": "서버가 정상적으로 실행 중입니다."
}
```

---

## 4. 카테고리 (Categories)

**카테고리 구조**: 메인 카테고리(parentId=null) → 디테일 카테고리(parentId=메인ID) 2단계 계층 구조.

| 구분 | 설명 | 예시 |
|------|------|------|
| 메인 | 최상위 분류 | GPS플로터 어군탐지기, 레이더, 부품 및 액세서리 |
| 디테일 | 메인 하위 분류 | HDS 시리즈(터치), HALO, 썬커버 |

### 4.1 카테고리 목록 조회 (전체)

```
GET /categories
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| search | string | X | 이름 검색 |
| isActive | boolean | X | 활성화 여부 (기본: 전체) |
| page | number | X | 페이지 (기본: 1) |
| take | number | X | 페이지당 개수 (기본값, 최대 100) |

**Response** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "피시 finder",
      "description": "물고기 탐지기",
      "isActive": true,
      "createdAt": "2025-03-05T00:00:00.000Z",
      "updatedAt": "2025-03-05T00:00:00.000Z"
    }
  ],
  "total": 10,
  "page": 1,
  "take": 20,
  "totalPages": 1
}
```

---

### 4.1.1 메인 카테고리만 조회 (클라이언트용)

```
GET /categories/main
```

**설명**  
`parentId`가 null인 메인 카테고리만 반환. 네비게이션·필터 등에 사용.

**Response** `200 OK`

```json
[
  {
    "id": "uuid",
    "name": "GPS플로터 어군탐지기",
    "description": "GPS 플로터 및 어군탐지기",
    "isActive": true,
    "createdAt": "2025-03-05T00:00:00.000Z",
    "updatedAt": "2025-03-05T00:00:00.000Z"
  },
  {
    "id": "uuid",
    "name": "레이더",
    "description": "선박용 레이더",
    "isActive": true,
    "createdAt": "2025-03-05T00:00:00.000Z",
    "updatedAt": "2025-03-05T00:00:00.000Z"
  }
]
```

(페이지네이션 없음, 활성 메인 카테고리 배열)

---

### 4.2 카테고리 단건 조회

```
GET /categories/:id
```

**Path**
- `id`: UUID

**Response** `200 OK`

```json
{
  "id": "uuid",
  "name": "피시 finder",
  "description": "물고기 탐지기",
  "isActive": true,
  "createdAt": "2025-03-05T00:00:00.000Z",
  "updatedAt": "2025-03-05T00:00:00.000Z"
}
```

---

### 4.3 카테고리 생성

```
POST /categories
```

**Request Body**

```json
{
  "name": "피시 finder",
  "description": "물고기 탐지기",
  "isActive": true
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| name | string | O | 최대 100자 |
| description | string | X | - |
| isActive | boolean | X | 기본 true |

**Response** `201 Created`  
(단건 조회와 동일 구조)

---

### 4.4 카테고리 수정

```
PATCH /categories/:id
```

**Request Body** (모든 필드 선택)

```json
{
  "name": "피시 finder",
  "description": "설명 수정",
  "isActive": false
}
```

**Response** `200 OK`

---

### 4.5 카테고리 삭제

```
DELETE /categories/:id
```

**Response** `204 No Content`

---

## 5. 브랜드 (Brands)

### 5.1 브랜드 목록 조회

```
GET /brands
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| search | string | X | 이름 검색 |
| isActive | boolean | X | 활성화 여부 |

**Response** `200 OK`

```json
[
  {
    "id": "uuid",
    "slug": "lowrance",
    "name": "로우런스",
    "description": "설명",
    "logo": "/brands/lowrance.png",
    "logoUrl": "http://localhost:3000/brands/lowrance.png",
    "backgroundColor": "bg-white",
    "gradientColor": "from-red-600 to-red-800",
    "hasLogo": true,
    "hasOverlay": false,
    "productCount": 15,
    "isActive": true,
    "createdAt": "2025-03-05T00:00:00.000Z",
    "updatedAt": "2025-03-05T00:00:00.000Z"
  }
]
```

---

### 5.2 브랜드 단건 조회

```
GET /brands/:idOrSlug
```

**Path**
- `idOrSlug`: UUID 또는 slug (예: `lowrance`)

**Response** `200 OK`  
(목록의 단일 객체와 동일)

---

### 5.3 브랜드 생성

```
POST /brands
```

**Request Body**

```json
{
  "slug": "lowrance",
  "name": "로우런스",
  "description": "설명",
  "logo": "/brands/lowrance.png",
  "backgroundColor": "bg-white",
  "gradientColor": "from-red-600 to-red-800",
  "hasLogo": true,
  "hasOverlay": false
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| slug | string | O | 소문자, 숫자, 하이픈만 (`^[a-z0-9-]+$`) |
| name | string | O | - |
| description | string | X | - |
| logo | string | X | - |
| backgroundColor | string | X | - |
| gradientColor | string | X | - |
| hasLogo | boolean | X | - |
| hasOverlay | boolean | X | - |

**Response** `201 Created`

---

### 5.4 브랜드 수정

```
PATCH /brands/:idOrSlug
```

**Request Body**  
(생성과 동일, 모든 필드 선택)

**Response** `200 OK`

---

### 5.5 브랜드 삭제

```
DELETE /brands/:idOrSlug
```

**Response** `204 No Content`

---

## 6. 상품 (Products)

### 6.1 상품 태그 (ProductTag)

| 값 | 설명 |
|----|------|
| BEST | 베스트 |
| NEW | 신상품 |
| SALE | 세일 |

### 6.2 정렬 필드 (SortField) / 정렬 순서 (SortOrder)

| SortField | 설명 |
|-----------|------|
| price | 가격 |
| createdAt | 등록일 (최신순) |
| rating | 평점 |
| salesCount | 판매량 |
| viewCount | 조회수 |

| SortOrder | 설명 |
|-----------|------|
| ASC | 오름차순 |
| DESC | 내림차순 |

**자주 쓰는 조합 예시**

| 용도 | sortBy | sortOrder |
|------|--------|-----------|
| 최신순 | createdAt | DESC |
| 가격 낮은순 | price | ASC |
| 가격 높은순 | price | DESC |
| 평점 높은순 | rating | DESC |
| 판매량순 | salesCount | DESC |

---

### 6.3 페이지네이션 (Page 기반)

- **Cursor 방식 아님** → **페이지 번호(page)** 기반

| 파라미터 | 설명 | 기본값 |
|----------|------|--------|
| page | 페이지 번호 (1부터 시작) | 1 |
| take | 페이지당 개수 | 20 |

**응답**
- `total`: 전체 건수
- `page`: 현재 페이지
- `take`: 페이지당 개수
- `totalPages`: 전체 페이지 수

---

### 6.4 상품 목록 조회

```
GET /products
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| brandId | string | X | 브랜드 ID 필터 |
| categoryId | string | X | 카테고리 ID 필터 |
| tag | ProductTag | X | BEST, NEW, SALE |
| search | string | X | 상품명 검색어 |
| minPrice | number | X | 최소 가격 |
| maxPrice | number | X | 최대 가격 |
| minRating | number | X | 최소 평점 |
| sortBy | SortField | X | 정렬 기준 (기본: createdAt) |
| sortOrder | SortOrder | X | ASC/DESC (기본: DESC) |
| isActive | boolean | X | 활성화 여부 (기본: true) |
| page | number | X | 페이지 번호 (기본: 1) |
| take | number | X | 페이지당 개수 1~100 (기본: 20) |

**Response** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "상품명",
      "description": "설명",
      "htmlDescription": "<p>HTML 설명</p>",
      "price": 299000,
      "image": "https://example.com/image.jpg",
      "tag": "BEST",
      "brandId": "uuid",
      "categoryId": "uuid",
      "stock": 10,
      "discountRate": 10,
      "rating": 4.5,
      "reviewCount": 100,
      "viewCount": 500,
      "salesCount": 50,
      "isActive": true,
      "createdAt": "2025-03-05T00:00:00.000Z",
      "updatedAt": "2025-03-05T00:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "take": 20,
  "totalPages": 3
}
```

**호출 예시**

```
GET /products?page=1&take=20&sortBy=createdAt&sortOrder=DESC
GET /products?page=2&take=10&sortBy=price&sortOrder=ASC
GET /products?brandId=uuid&page=1&sortBy=rating&sortOrder=DESC
```

---

### 6.5 인기 상품 조회

```
GET /products/top
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| limit | number | X | 조회 개수 (기본 5) |
| sortBy | SortField | X | 정렬 기준 (기본: salesCount) |

**Response** `200 OK`  
(상품 배열, 페이지네이션 없음)

---

### 6.6 브랜드별 상품 조회

```
GET /products/brand/:brandId
```

**Query Parameters**  
(6.4 상품 목록 조회와 동일)

- `page`, `take`, `sortBy`, `sortOrder`, `search`, `minPrice`, `maxPrice`, `tag` 등 모두 사용 가능

**Response** `200 OK`  
(페이지네이션 포함, 상품 목록 조회와 동일 형식)

**호출 예시**

```
GET /products/brand/lowrance-uuid?page=1&take=20&sortBy=createdAt&sortOrder=DESC
```

---

### 6.7 카테고리별 상품 조회 (특정 디테일 카테고리)

```
GET /products/category/:categoryId
```

**설명**  
지정한 카테고리 ID에 **직접** 속한 상품만 조회. (해당 디테일 카테고리에만 해당)

**Path**
- `categoryId`: 카테고리 UUID

**Query Parameters**  
(6.4 상품 목록 조회와 동일)

- `page`, `take`, `sortBy`, `sortOrder`, `search`, `minPrice`, `maxPrice`, `tag` 등 모두 사용 가능

**Response** `200 OK`  
(페이지네이션 포함, 상품 목록 조회와 동일 형식)

---

### 6.7.1 메인 카테고리별 상품 조회 (클라이언트용, 권장)

```
GET /products/main-category/:mainCategoryId
```

**설명**  
메인 카테고리와 그 하위 디테일 카테고리에 속한 상품을 모두 조회.  
예: "GPS플로터 어군탐지기" 선택 시 → HDS 시리즈, Elite 시리즈, 이글 시리즈 등 모든 관련 상품 반환.

**Path**
- `mainCategoryId`: 메인 카테고리 UUID (`GET /categories/main`에서 획득)

**Query Parameters**  
(6.4 상품 목록 조회와 동일)

- `page`, `take`, `sortBy`, `sortOrder`, `search`, `minPrice`, `maxPrice`, `tag`, `brandId` 등 사용 가능

**Response** `200 OK`  
(페이지네이션 포함, 상품 목록 조회와 동일 형식)

**호출 예시**

```
GET /products/main-category/{gps-메인-uuid}?page=1&take=20&sortBy=createdAt&sortOrder=DESC
GET /products/main-category/{gps-메인-uuid}?search=HDS&sortBy=price&sortOrder=ASC
```

---

### 6.8 상품 상세 조회

```
GET /products/:id
```

**Response** `200 OK`

```json
{
  "id": "uuid",
  "name": "상품명",
  "description": "설명",
  "htmlDescription": "<p>HTML 설명</p>",
  "price": 299000,
  "image": "https://example.com/image.jpg",
  "tag": "BEST",
  "brandId": "uuid",
  "categoryId": "uuid",
  "stock": 10,
  "discountRate": 10,
  "rating": 4.5,
  "reviewCount": 100,
  "viewCount": 500,
  "salesCount": 50,
  "isActive": true,
  "createdAt": "2025-03-05T00:00:00.000Z",
  "updatedAt": "2025-03-05T00:00:00.000Z",
  "images": [
    {
      "id": "uuid",
      "url": "https://example.com/img1.jpg",
      "alt": "대체 텍스트",
      "order": 0
    }
  ],
  "options": [
    {
      "id": "uuid",
      "name": "옵션명",
      "price": 10000,
      "stock": 5,
      "order": 0
    }
  ],
  "compatibilityProducts": [
    {
      "id": "uuid",
      "product": { "상품 객체" },
      "order": 0
    }
  ],
  "recommendationProducts": [
    {
      "id": "uuid",
      "product": { "상품 객체" },
      "order": 0
    }
  ]
}
```

---

### 6.9 상품 생성

```
POST /products
```

**Request Body**

```json
{
  "name": "상품명",
  "description": "설명",
  "htmlDescription": "<p>HTML</p>",
  "price": 299000,
  "image": "https://example.com/image.jpg",
  "tag": "BEST",
  "brandId": "uuid",
  "categoryId": "uuid",
  "stock": 10,
  "discountRate": 10,
  "rating": 4.5,
  "isActive": true
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| name | string | O | - |
| description | string | X | - |
| htmlDescription | string | X | - |
| price | number | O | >= 0 |
| image | string | X | URL 형식 |
| tag | ProductTag | X | BEST, NEW, SALE |
| brandId | string | O | - |
| categoryId | string | O | - |
| stock | number | X | >= 0 |
| discountRate | number | X | 0~100 |
| rating | number | X | 0~5 |
| isActive | boolean | X | - |

**Response** `201 Created`

---

### 6.10 상품 수정

```
PATCH /products/:id
```

**Request Body**  
(생성과 동일, 모든 필드 선택)

**Response** `200 OK`

---

### 6.11 상품 삭제

```
DELETE /products/:id
```

**Response** `204 No Content`

---

## 7. 장바구니 (Cart) — 인증 필요

모든 요청에 `Authorization: Bearer <token>` 필요.

### 7.1 장바구니 조회

```
GET /cart
```

**Response** `200 OK`

```json
[
  {
    "id": "uuid",
    "productId": "uuid",
    "product": { "상품 객체" },
    "optionId": "uuid",
    "option": {
      "id": "uuid",
      "name": "옵션명",
      "price": 10000
    },
    "quantity": 2,
    "createdAt": "2025-03-05T00:00:00.000Z",
    "updatedAt": "2025-03-05T00:00:00.000Z"
  }
]
```

---

### 7.2 장바구니 추가

```
POST /cart
```

**Request Body**

```json
{
  "productId": "uuid",
  "optionId": "uuid",
  "quantity": 2
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| productId | string | O | UUID |
| optionId | string | X | UUID (상품 옵션) |
| quantity | number | O | >= 1 |

**Response** `201 Created`  
(장바구니 항목 객체)

---

### 7.3 장바구니 수량 수정

```
PATCH /cart/:itemId
```

**Request Body**

```json
{
  "quantity": 3
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| quantity | number | O | >= 1 |

**Response** `200 OK`

---

### 7.4 장바구니 항목 삭제

```
DELETE /cart/:itemId
```

**Response** `204 No Content`

---

### 7.5 장바구니 비우기

```
DELETE /cart
```

**Response** `204 No Content`

---

## 8. 위시리스트 (Wishlist) — 인증 필요

### 8.1 위시리스트 조회

```
GET /wishlist
Authorization: Bearer <token>
```

**Response** `200 OK`

```json
[
  {
    "id": "uuid",
    "productId": "uuid",
    "product": { "상품 객체" },
    "createdAt": "2025-03-05T00:00:00.000Z",
    "updatedAt": "2025-03-05T00:00:00.000Z"
  }
]
```

---

### 8.2 위시리스트 추가

```
POST /wishlist
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "productId": "uuid"
}
```

| 필드 | 타입 | 필수 |
|------|------|------|
| productId | string | O | UUID |

**Response** `201 Created`  
(위시리스트 항목 객체)

---

### 8.3 위시리스트 항목 삭제 (itemId)

```
DELETE /wishlist/:itemId
```

**Response** `204 No Content`

---

### 8.4 위시리스트 항목 삭제 (productId)

```
DELETE /wishlist/product/:productId
```

**Response** `204 No Content`

---

## 9. 시뮬레이터 세트 (Simulator Sets)

### 9.1 시뮬레이터 세트 목록 조회

```
GET /simulator/sets
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| search | string | X | 검색어 |
| isActive | boolean | X | 활성화 여부 |
| page | number | X | 페이지 |
| take | number | X | 페이지당 개수 (1~100) |

**Response** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "세트명",
      "description": "설명",
      "isActive": true,
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "categoryId": "uuid"
        }
      ],
      "createdAt": "2025-03-05T00:00:00.000Z",
      "updatedAt": "2025-03-05T00:00:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "take": 20,
  "totalPages": 1
}
```

---

### 9.2 시뮬레이터 세트 단건 조회

```
GET /simulator/sets/:id
```

**Response** `200 OK`  
(목록의 단일 객체와 동일)

---

### 9.3 시뮬레이터 세트 생성

```
POST /simulator/sets
```

**Request Body**

```json
{
  "name": "세트명",
  "description": "설명",
  "isActive": true,
  "items": [
    {
      "productId": "uuid",
      "categoryId": "uuid"
    }
  ]
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| name | string | O | 최대 100자 |
| description | string | X | - |
| isActive | boolean | X | - |
| items | array | O | 최소 1개 |
| items[].productId | string | O | 상품 UUID |
| items[].categoryId | string | O | 카테고리 UUID (클라이언트 배치용) |

**Response** `201 Created`

---

### 9.4 시뮬레이터 세트 수정

```
PATCH /simulator/sets/:id
```

**Request Body**  
(생성과 동일, 모든 필드 선택)

**Response** `200 OK`

---

### 9.5 시뮬레이터 세트 삭제

```
DELETE /simulator/sets/:id
```

**Response** `204 No Content`

---

## 10. 컨설팅 신청 (Consulting) — 인증 필요

### 10.1 상태 (ConsultingRequestStatus)

| 값 | 설명 |
|----|------|
| PENDING | 대기 |
| IN_PROGRESS | 진행 중 |
| COMPLETED | 완료 |
| CANCELLED | 취소 |

---

### 10.2 컨설팅 신청

```
POST /consulting
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "title": "제목",
  "content": "내용"
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| title | string | O | 최대 150자 |
| content | string | O | - |

**Response** `201 Created`

```json
{
  "id": "uuid",
  "userId": "uuid",
  "title": "제목",
  "content": "내용",
  "status": "PENDING",
  "createdAt": "2025-03-05T00:00:00.000Z",
  "updatedAt": "2025-03-05T00:00:00.000Z"
}
```

---

### 10.3 내 컨설팅 목록 조회

```
GET /consulting/me
Authorization: Bearer <token>
```

**Response** `200 OK`  
(컨설팅 객체 배열)

---

## 11. 사용성 서비스 신청 (Usability Services) — 인증 필요

### 11.1 상태 (UsabilityServiceRequestStatus)

| 값 | 설명 |
|----|------|
| PENDING | 대기 |
| IN_PROGRESS | 진행 중 |
| COMPLETED | 완료 |
| CANCELLED | 취소 |

---

### 11.2 사용성 서비스 신청

```
POST /usability-services
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "title": "제목",
  "content": "내용"
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| title | string | O | 최대 150자 |
| content | string | O | - |

**Response** `201 Created`

```json
{
  "id": "uuid",
  "userId": "uuid",
  "title": "제목",
  "content": "내용",
  "status": "PENDING",
  "createdAt": "2025-03-05T00:00:00.000Z",
  "updatedAt": "2025-03-05T00:00:00.000Z"
}
```

---

### 11.3 내 사용성 서비스 목록 조회

```
GET /usability-services/me
Authorization: Bearer <token>
```

**Response** `200 OK`  
(위와 동일한 객체 배열)

---

## 12. 주문 (Orders)

### 12.1 주문 상태 (OrderStatus)

| 값 | 설명 |
|----|------|
| PENDING | 대기 |
| PAID | 결제 완료 |
| CANCELLED | 취소 |

### 12.2 결제 상태 (PaymentStatus)

| 값 | 설명 |
|----|------|
| PENDING | 대기 |
| COMPLETED | 완료 |
| FAILED | 실패 |

---

### 12.3 회원 주문 생성 (인증 필요)

```
POST /orders
Authorization: Bearer <accessToken>
```

**Request Body**

```json
{
  "items": [
    {
      "productId": "uuid",
      "optionId": "uuid",
      "quantity": 2
    }
  ],
  "paymentMethod": "CARD",
  "note": "배송 시 연락 주세요"
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| items | array | O | 최소 1개 |
| items[].productId | string | O | - |
| items[].optionId | string | X | - |
| items[].quantity | number | O | >= 1 |
| paymentMethod | string | O | - |
| note | string | X | 최대 255자 |

**Response** `201 Created`

```json
{
  "id": "uuid",
  "userId": "uuid",
  "totalAmount": 598000,
  "status": "PENDING",
  "note": "배송 시 연락 주세요",
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "optionId": "uuid",
      "quantity": 2,
      "unitPrice": 299000
    }
  ],
  "payment": {
    "id": "uuid",
    "paymentMethod": "CARD",
    "amount": 598000,
    "status": "PENDING"
  },
  "createdAt": "2025-03-05T00:00:00.000Z",
  "updatedAt": "2025-03-05T00:00:00.000Z"
}
```

---

### 12.4 비회원 주문 생성 (인증 불필요)

```
POST /orders/guest
```

**Request Body**

```json
{
  "guestName": "홍길동",
  "guestEmail": "guest@example.com",
  "guestPhone": "010-1234-5678",
  "items": [
    {
      "productId": "uuid",
      "optionId": "uuid",
      "quantity": 2
    }
  ],
  "paymentMethod": "CARD",
  "note": "배송 시 연락 주세요"
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| guestName | string | O | 최대 100자 |
| guestEmail | string | O | 최대 255자 |
| guestPhone | string | X | 최대 20자 |
| items | array | O | 최소 1개 |
| items[].productId | string | O | - |
| items[].optionId | string | X | - |
| items[].quantity | number | O | >= 1 |
| paymentMethod | string | O | - |
| note | string | X | 최대 255자 |

**Response** `201 Created`  
(회원 주문과 동일 구조, `userId` 없고 `guestName`, `guestEmail`, `guestPhone` 포함)

---

### 12.5 비회원 주문 조회 (인증 불필요)

```
GET /orders/guest/:orderId?email=guest@example.com
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| email | string | O | 주문 시 입력한 이메일 (일치해야 조회 가능) |

**Response** `200 OK`  
(주문 상세, 회원 주문과 동일 구조)

---

### 12.6 내 주문 목록 조회 (인증 필요)

```
GET /orders/me
Authorization: Bearer <accessToken>
```

**Response** `200 OK`  
(주문 객체 배열)

---

## 13. 에러 응답 예시

### 13.1 400 Bad Request (Validation)

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

### 13.2 401 Unauthorized (인증 필요)

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 13.3 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

---

## 14. 요약: 인증 필요 API

| 메서드 | 경로 | 인증 |
|--------|------|------|
| POST | /auth/refresh | X (refreshToken body) |
| GET | /auth/me | O |
| PATCH | /auth/me | O |
| POST | /auth/logout | O |
| * | /cart/* | O |
| * | /wishlist/* | O |
| POST | /consulting | O |
| GET | /consulting/me | O |
| POST | /usability-services | O |
| GET | /usability-services/me | O |
| POST | /orders | O |
| POST | /orders/guest | X |
| GET | /orders/guest/:orderId | X (email 쿼리 필수) |
| GET | /orders/me | O |

나머지 엔드포인트는 인증 없이 호출 가능합니다.
