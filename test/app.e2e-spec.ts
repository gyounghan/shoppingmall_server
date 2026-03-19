import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * E2E 테스트
 * 실행: npm run test:e2e
 * 참고: MySQL DB가 실행 중이어야 합니다. (.env 설정 필요)
 */
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('헬스체크', () => {
    it('GET /health - 서버 상태를 반환한다', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('message');
        });
    });

    it('GET / - 루트 경로 응답', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200);
    });
  });
});
