import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashed',
    name: '테스트',
    phone: null,
    role: 'customer' as any,
    fishingPoints: 0,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findActiveById: jest.fn(),
  };

  const mockRefreshTokensRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findByJti: jest.fn(),
    deleteByUserId: jest.fn(),
    deleteByJtiAndUserId: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('jwt-token'),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: RefreshTokensRepository, useValue: mockRefreshTokensRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockRefreshTokensRepository.create.mockImplementation((obj) => obj);
    mockRefreshTokensRepository.save.mockResolvedValue({});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('회원가입 후 JWT 토큰을 반환한다', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.create.mockReturnValue(mockUser);
      mockUsersRepository.save.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: '테스트',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('jwt-token');
      expect(result.refreshToken).toBe('jwt-token');
      expect(result.expiresIn).toBeGreaterThan(0);
    });

    it('이메일 중복 시 ConflictException을 던진다', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: '테스트',
        }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: '테스트',
        }),
      ).rejects.toThrow('이미 등록된 이메일입니다');
    });
  });

  describe('login', () => {
    it('로그인 후 JWT 토큰을 반환한다', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);
      mockUsersRepository.save.mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed');
      expect(result.accessToken).toBe('jwt-token');
      expect(result.refreshToken).toBe('jwt-token');
    });

    it('사용자가 없으면 UnauthorizedException을 던진다', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login({ email: 'wrong@example.com', password: 'password123' }),
      ).rejects.toThrow('이메일 또는 비밀번호가 올바르지 않습니다');
    });

    it('비활성 계정이면 UnauthorizedException을 던진다', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(
        service.login({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow('비활성화된 계정입니다');
    });

    it('비밀번호 불일치 시 UnauthorizedException을 던진다', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('유효한 userId면 User를 반환한다', async () => {
      mockUsersRepository.findActiveById.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-123');

      expect(result).toEqual(mockUser);
    });

    it('없거나 비활성이면 null을 반환한다', async () => {
      mockUsersRepository.findActiveById.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('프로필을 수정한다', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockUser);
      mockUsersRepository.save.mockResolvedValue({
        ...mockUser,
        name: '새이름',
        phone: '010-1234-5678',
      });

      const result = await service.updateProfile('user-123', {
        name: '새이름',
        phone: '010-1234-5678',
      });

      expect(result.name).toBe('새이름');
      expect(result.phone).toBe('010-1234-5678');
    });

    it('사용자가 없으면 UnauthorizedException을 던진다', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateProfile('nonexistent', { name: '이름' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
