# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev        # Start with hot reload
npm run build            # Compile TypeScript to dist/

# Testing
npm run test             # Unit tests (Jest)
npm run test:cov         # Unit tests with coverage
npm run test:e2e         # E2E tests (requires running DB)
npm test -- --testPathPattern=products  # Run a single test file

# Code quality
npm run lint             # ESLint with auto-fix
npm run format           # Prettier formatting

# Database
npm run seed             # Seed DB with brands, categories, products, simulator sets
```

## Architecture

This is a **NestJS + TypeORM + MySQL** backend for a marine/fishing supplies e-commerce platform.

### Module Structure

Each feature module follows the same NestJS pattern: `controller → service → repository (TypeORM entity)`. Every module lives under `src/<module>/` with:
- `<module>.controller.ts` — HTTP routes
- `<module>.service.ts` — Business logic
- `<module>.module.ts` — DI wiring
- `dto/` — Validation DTOs (class-validator)
- `entities/` — TypeORM entity definitions

Feature modules: `auth`, `products`, `brands`, `categories`, `cart`, `wishlist`, `orders`, `simulator`, `consulting`, `usability-service`, `payments`.

### Authentication Flow

JWT-based auth in `src/auth/`. Two-token system:
- Access token (15m default) — validated via `JwtAuthGuard` + `JwtStrategy`
- Refresh token (7d default) — stored in `refresh_tokens` table
- Both expiry durations configured via `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES` env vars

Protect endpoints by adding `@UseGuards(JwtAuthGuard)` to controllers.

### Key Entity Relationships

- **Product** has many `ProductImage`, `ProductOption`, `ProductCompatibility`, `ProductRecommendation`
- **Product** belongs to `Brand` and `Category`
- **User** has many `CartItem`, `WishlistItem`, `Order`, `RefreshToken`
- **Order** has many `OrderItem` → each linked to a `Product` + optional `ProductOption`
- **SimulatorSet** has many `SimulatorSetItem` → each linked to a `Product`

### Database Configuration

TypeORM with `synchronize: true` in development (auto-creates/alters tables). Configured via env vars: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`.

**Important:** When moving to production, set `synchronize: false` and use proper migrations.

### Environment Variables

Required in `.env`:
```
DB_TYPE / DB_HOST / DB_PORT / DB_USERNAME / DB_PASSWORD / DB_DATABASE
PORT=3500
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET
```

### Static Assets

Product images are served from `/public/` directory at `http://localhost:3500/public/<path>`. `app.useStaticAssets('public')` is set in `main.ts`.

### TypeScript Notes

`tsconfig.json` has `strictNullChecks: false` and `noImplicitAny: false` — the codebase intentionally uses relaxed TypeScript checks. Don't tighten these without coordinating with the team.

한국어로 응답하세요
유닛 테스트 가능하도록 해주세요
테스트 코드도 개발해주세요
현업, 실무에서 사용하는 구조로 추천해주세요
