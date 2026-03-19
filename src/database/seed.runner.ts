import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { seedBrands } from '../brands/brands.seed';
import { seedCategories } from '../categories/categories.seed';
import { seedProducts } from '../products/products.seed';
import { seedSimulatorSets } from '../simulator/simulator.seed';
import { Category } from '../categories/entities/category.entity';
import { Brand } from '../brands/entities/brand.entity';

/**
 * 금호마린테크(kumhomarine.com) 실제 데이터 기반 통합 시드
 * 실행: npm run seed
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get<DataSource>(getDataSourceToken());

  try {
    console.log('\n===== 시드 데이터 생성 시작 =====\n');

    // 1. 브랜드
    console.log('[1/4] 브랜드 시드...');
    await seedBrands(dataSource);

    // 2. 카테고리
    console.log('\n[2/4] 카테고리 시드...');
    await seedCategories(dataSource);

    // 3. 매핑 생성
    const categories = await dataSource.getRepository(Category).find();
    const brands = await dataSource.getRepository(Brand).find();

    const categoryNameToId = new Map(categories.map((c) => [c.name, c.id]));
    const brandSlugToId = new Map(brands.map((b) => [b.slug, b.id]));

    // 4. 상품
    console.log('\n[3/4] 상품 시드...');
    await seedProducts(dataSource, categoryNameToId, brandSlugToId);

    // 5. 시뮬레이터 세트 (프리미엄/가심비/가성비)
    console.log('\n[4/4] 시뮬레이터 시드...');
    await seedSimulatorSets(dataSource);

    console.log('\n===== 시드 데이터 생성 완료 =====\n');
  } catch (error) {
    console.error('시드 데이터 생성 중 오류 발생:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
