import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { ProductsService } from '../products/products.service';
import { Brand } from './entities/brand.entity';
import { BrandsRepository } from './repositories/brands.repository';

describe('BrandsService', () => {
  let service: BrandsService;

  const mockBrand: Brand = {
    id: 'brand-123',
    slug: 'lowrance',
    name: '로우런스',
    description: '설명',
    logo: '/brands/lowrance.png',
    backgroundColor: 'bg-white',
    gradientColor: null,
    hasLogo: true,
    hasOverlay: false,
    productCount: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBrandsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findBySlug: jest.fn(),
    findByIdOrSlug: jest.fn(),
    findAll: jest.fn(),
  };

  const mockProductsService = {
    findAll: jest.fn().mockResolvedValue({ total: 5 }),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(3300),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandsService,
        { provide: BrandsRepository, useValue: mockBrandsRepository },
        { provide: ProductsService, useValue: mockProductsService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<BrandsService>(BrandsService);
    jest.clearAllMocks();
    mockProductsService.findAll.mockResolvedValue({ total: 5 });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('브랜드를 생성한다', async () => {
      mockBrandsRepository.findBySlug.mockResolvedValue(null);
      mockBrandsRepository.create.mockReturnValue(mockBrand);
      mockBrandsRepository.save.mockResolvedValue(mockBrand);

      const result = await service.create({
        slug: 'lowrance',
        name: '로우런스',
      });

      expect(mockBrandsRepository.findBySlug).toHaveBeenCalledWith('lowrance');
      expect(result.slug).toBe('lowrance');
      expect(result.name).toBe('로우런스');
    });

    it('slug 중복 시 ConflictException을 던진다', async () => {
      mockBrandsRepository.findBySlug.mockResolvedValue(mockBrand);

      await expect(
        service.create({ slug: 'lowrance', name: '로우런스' }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.create({ slug: 'lowrance', name: '로우런스' }),
      ).rejects.toThrow('이미 존재하는 브랜드 slug입니다');
    });
  });

  describe('findAll', () => {
    it('브랜드 목록과 productCount를 반환한다', async () => {
      mockBrandsRepository.findAll.mockResolvedValue([mockBrand]);

      const result = await service.findAll({});

      expect(mockProductsService.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].productCount).toBe(5);
    });
  });

  describe('findOne', () => {
    it('id 또는 slug로 브랜드를 조회한다', async () => {
      mockBrandsRepository.findByIdOrSlug.mockResolvedValue(mockBrand);

      const result = await service.findOne('lowrance');

      expect(mockBrandsRepository.findByIdOrSlug).toHaveBeenCalledWith('lowrance');
      expect(result.slug).toBe('lowrance');
    });

    it('존재하지 않으면 NotFoundException을 던진다', async () => {
      mockBrandsRepository.findByIdOrSlug.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent')).rejects.toThrow('브랜드를 찾을 수 없습니다');
    });
  });

  describe('update', () => {
    it('브랜드를 수정한다', async () => {
      mockBrandsRepository.findByIdOrSlug.mockResolvedValue(mockBrand);
      mockBrandsRepository.save.mockResolvedValue({ ...mockBrand, name: '수정됨' });

      const result = await service.update('lowrance', { name: '수정됨' });

      expect(result.name).toBe('수정됨');
    });

    it('slug 변경 시 중복이면 ConflictException을 던진다', async () => {
      mockBrandsRepository.findByIdOrSlug.mockResolvedValue(mockBrand);
      mockBrandsRepository.findBySlug.mockResolvedValue({ id: 'other', slug: 'garmin' });

      await expect(
        service.update('lowrance', { slug: 'garmin' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('브랜드를 비활성화한다 (soft delete)', async () => {
      mockBrandsRepository.findByIdOrSlug.mockResolvedValue(mockBrand);
      mockBrandsRepository.save.mockResolvedValue({ ...mockBrand, isActive: false });

      await service.remove('lowrance');

      expect(mockBrandsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });

    it('존재하지 않으면 NotFoundException을 던진다', async () => {
      mockBrandsRepository.findByIdOrSlug.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
