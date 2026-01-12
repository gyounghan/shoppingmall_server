import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { envVariableKeys } from './common/env-variable-keys';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);

    // 정적 파일 서빙 설정 (이미지 등)
    app.useStaticAssets(join(__dirname, '..', 'public'), {
        prefix: '/',
    });

    // CORS 설정 (외부 접속 허용)
    const corsOrigin = configService.get<string>(envVariableKeys.corsOrigin);
    const allowedOrigins = corsOrigin
        ? corsOrigin.split(',').map((origin) => origin.trim())
        : ['http://localhost:5173'];

    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
    });

    const port = configService.get<number>(envVariableKeys.port) || 3000;
    await app.listen(port, '0.0.0.0'); // 0.0.0.0으로 리스닝하여 외부 접속 허용
    console.log(`서버가 http://0.0.0.0:${port} 에서 실행 중입니다.`);
    console.log(`로컬 접속: http://localhost:${port}`);
    console.log(`정적 파일 경로: ${join(__dirname, '..', 'public')}`);
}
bootstrap();

