import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokensRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  create(data: Partial<RefreshToken>): RefreshToken {
    return this.refreshTokenRepo.create(data as RefreshToken);
  }

  save(token: RefreshToken): Promise<RefreshToken> {
    return this.refreshTokenRepo.save(token);
  }

  findByJti(jti: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepo.findOne({ where: { jti } });
  }

  remove(token: RefreshToken): Promise<RefreshToken> {
    return this.refreshTokenRepo.remove(token);
  }

  deleteByUserId(userId: string): Promise<void> {
    return this.refreshTokenRepo.delete({ userId }).then(() => undefined);
  }

  deleteByJtiAndUserId(jti: string, userId: string): Promise<void> {
    return this.refreshTokenRepo.delete({ jti, userId }).then(() => undefined);
  }
}
