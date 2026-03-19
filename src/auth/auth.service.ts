import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { envVariableKeys } from '../common/env-variable-keys';

const ACCESS_EXPIRES_DEFAULT = '15m';
const REFRESH_EXPIRES_DEFAULT = '7d';

@Injectable()
export class AuthService {
  private readonly accessExpires: string;
  private readonly refreshExpires: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessExpires =
      this.configService.get<string>(envVariableKeys.jwtAccessExpires) ||
      ACCESS_EXPIRES_DEFAULT;
    this.refreshExpires =
      this.configService.get<string>(envVariableKeys.jwtRefreshExpires) ||
      REFRESH_EXPIRES_DEFAULT;
  }

  private parseExpiresToSeconds(expires: string): number {
    const match = expires.match(/^(\d+)([smhd])$/);
    if (!match) return 900;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };
    return value * (multipliers[unit] ?? 60);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // 이메일 중복 확인
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('이미 등록된 이메일입니다.');
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 사용자 생성
    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      phone: registerDto.phone,
    });

    const savedUser = await this.userRepository.save(user);

    return this.issueTokenPair(savedUser);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // 사용자 찾기
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('비활성화된 계정입니다.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return this.issueTokenPair(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    let payload: { sub: string; jti: string; type?: string };
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('리프레시 토큰이 유효하지 않습니다.');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('리프레시 토큰이 아닙니다.');
    }

    const stored = await this.refreshTokenRepository.findOne({
      where: { jti: payload.jti },
    });

    if (!stored || new Date() > stored.expiresAt) {
      if (stored) await this.refreshTokenRepository.remove(stored);
      throw new UnauthorizedException('리프레시 토큰이 만료되었거나 무효화되었습니다.');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub, isActive: true },
    });
    if (!user) {
      await this.refreshTokenRepository.remove(stored);
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    await this.refreshTokenRepository.remove(stored);
    return this.issueTokenPair(user);
  }

  async revokeRefreshToken(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      try {
        const payload = this.jwtService.verify(refreshToken);
        if (payload.jti) {
          await this.refreshTokenRepository.delete({
            jti: payload.jti,
            userId,
          });
        }
      } catch {
        //
      }
    } else {
      await this.refreshTokenRepository.delete({ userId });
    }
  }

  private async issueTokenPair(user: User): Promise<AuthResponseDto> {
    const jti = randomUUID();
    const expiresAt = new Date();
    const refreshSeconds = this.parseExpiresToSeconds(this.refreshExpires);
    expiresAt.setSeconds(expiresAt.getSeconds() + refreshSeconds);

    const [accessToken, refreshTokenJwt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: user.id, email: user.email, type: 'access' },
        { expiresIn: this.parseExpiresToSeconds(this.accessExpires) },
      ),
      this.jwtService.signAsync(
        { sub: user.id, jti, type: 'refresh' },
        { expiresIn: this.parseExpiresToSeconds(this.refreshExpires) },
      ),
    ]);

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        userId: user.id,
        jti,
        expiresAt,
      }),
    );

    const accessSeconds = this.parseExpiresToSeconds(this.accessExpires);
    return new AuthResponseDto(
      user,
      accessToken,
      refreshTokenJwt,
      accessSeconds,
    );
  }

  async validateUser(userId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    return user || null;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<AuthResponseDto['user']> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('유저를 찾을 수 없습니다.');
    }

    if (updateProfileDto.name !== undefined) {
      user.name = updateProfileDto.name;
    }
    if (updateProfileDto.phone !== undefined) {
      user.phone = updateProfileDto.phone;
    }

    const savedUser = await this.userRepository.save(user);
    return new AuthResponseDto(savedUser, '', '', 0).user;
  }
}

