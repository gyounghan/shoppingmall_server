# 명장쇼핑몰 서버 테스트 가이드

## 테스트 종류

| 구분 | 명령어 | 설명 |
|------|--------|------|
| 단위 테스트 | `npm run test` | 각 모듈 Service 단위 테스트 (DB 불필요) |
| 커버리지 | `npm run test:cov` | 커버리지 리포트 생성 |
| E2E 테스트 | `npm run test:e2e` | 전체 앱 HTTP 테스트 (**DB 필요**) |

## 모듈별 테스트 현황

| 모듈 | 파일 | 테스트 케이스 |
|------|------|----------------|
| Categories | `categories.service.spec.ts` | create, findAll, findOne, update, remove |
| Products | `products.service.spec.ts` | create, findAll, findOne, update, remove, getTopProducts, getProductsByBrand/Category |
| Brands | `brands.service.spec.ts` | create, findAll, findOne, update, remove, slug 중복 |
| Auth | `auth.service.spec.ts` | register, login, validateUser, updateProfile |
| Cart | `cart.service.spec.ts` | addItem, findAll, update, remove, clear |
| Wishlist | `wishlist.service.spec.ts` | addItem, findAll, remove, removeByProductId |
| Simulator | `simulator.service.spec.ts` | create, findAll, findOne, update, remove |
| Consulting | `consulting.service.spec.ts` | create, findMine |
| UsabilityService | `usability-service.service.spec.ts` | create, findMine |
| Orders | `orders.service.spec.ts` | create, findMine |

## E2E 테스트 실행 조건

- MySQL DB가 실행 중이어야 함
- `.env`에 DB 연결 정보 설정 필요

```bash
# .env 예시
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=shoppingmall
```

DB 없이 단위 테스트만 실행하려면:

```bash
npm run test
```
