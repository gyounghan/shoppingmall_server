import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { seedBrands } from './brands.seed';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get<DataSource>(getDataSourceToken());

    try {
        console.log('브랜드 시드 데이터 생성 시작...');
        await seedBrands(dataSource);
        console.log('브랜드 시드 데이터 생성 완료!');
    } catch (error) {
        console.error('시드 데이터 생성 중 오류 발생:', error);
        process.exit(1);
    } finally {
        await app.close();
    }
}

bootstrap();

