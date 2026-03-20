import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { join } from 'path';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { envVariableKeys } from './common/env-variable-keys';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { createWinstonConfig } from './common/logger/winston.config';

async function bootstrap() {
    const nodeEnv = process.env.NODE_ENV || 'development';

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: WinstonModule.createLogger(createWinstonConfig(nodeEnv)),
    });

    const logger = new Logger('Bootstrap');
    const configService = app.get(ConfigService);

    // Helmet — HTTP 보안 헤더
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' }, // 정적 파일 CORS 허용
    }));

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

    // 전역 예외 필터
    app.useGlobalFilters(new HttpExceptionFilter());

    // 전역 응답 인터셉터
    app.useGlobalInterceptors(new TransformInterceptor());

    // 전역 유효성 검사 파이프
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    // Swagger 문서화 (프로덕션 제외)
    const appNodeEnv = configService.get<string>(envVariableKeys.nodeEnv);
    if (appNodeEnv !== 'production') {
        const swaggerConfig = new DocumentBuilder()
            .setTitle('명장쇼핑몰 API')
            .setDescription('낚시/해양 용품 쇼핑몰 REST API')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, swaggerConfig);
        SwaggerModule.setup('api-docs', app, document);
    }

    const port = configService.get<number>(envVariableKeys.port) || 3000;
    await app.listen(port, '0.0.0.0');

    logger.log(`서버가 http://0.0.0.0:${port} 에서 실행 중입니다.`);
    logger.log(`로컬 접속: http://localhost:${port}`);
    if (appNodeEnv !== 'production') {
        logger.log(`Swagger 문서: http://localhost:${port}/api-docs`);
    }
    logger.log(`정적 파일 경로: ${join(__dirname, '..', 'public')}`);
}
bootstrap();
