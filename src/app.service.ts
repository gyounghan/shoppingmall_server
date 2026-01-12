import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '명장쇼핑몰 API 서버입니다.';
  }
}

