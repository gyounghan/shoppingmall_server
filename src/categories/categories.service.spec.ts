import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './repositories/categories.repository';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategory: Category = {
    id: 'cat-123',
    name: '피시 finder',
    description: '물고기 탐지기',
    parentId: null,
    parent: null,
    children: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategoriesRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
    findByIdActive: jest.fn(),
    findMainCategories: jest.fn(),
    findAll: jest.fn().mockResolvedValue([[mockCategory], 1]),
    findChildCategoryIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: mockCategoriesRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
    mockCategoriesRepository.findAll.mockResolvedValue([[mockCategory], 1]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('카테고리를 생성한다', async () => {
      const dto: CreateCategoryDto = {
        name: '피시 finder',
        description: '물고기 탐지기',
        isActive: true,
      };
      mockCategoriesRepository.create.mockReturnValue({ ...mockCategory, ...dto });
      mockCategoriesRepository.save.mockResolvedValue(mockCategory);

      const result = await service.create(dto);

      expect(mockCategoriesRepository.create).toHaveBeenCalledWith({
        ...dto,
        isActive: true,
      });
      expect(mockCategoriesRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(mockCategory.id);
      expect(result.name).toBe(mockCategory.name);
    });

    it('isActive 미지정 시 true로 생성한다', async () => {
      const dto: CreateCategoryDto = { name: '카테고리' };
      mockCategoriesRepository.create.mockReturnValue({ ...mockCategory });
      mockCategoriesRepository.save.mockResolvedValue(mockCategory);

      await service.create(dto);

      expect(mockCategoriesRepository.create).toHaveBeenCalledWith({
        ...dto,
        isActive: true,
      });
    });
  });

  describe('findAll', () => {
    it('페이지네이션된 카테고리 목록을 반환한다', async () => {
      const query: QueryCategoryDto = { page: 1, take: 20 };
      const result = await service.findAll(query);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.take).toBe(20);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('ID로 카테고리를 조회한다', async () => {
      mockCategoriesRepository.findByIdActive.mockResolvedValue(mockCategory);

      const result = await service.findOne('cat-123');

      expect(mockCategoriesRepository.findByIdActive).toHaveBeenCalledWith('cat-123');
      expect(result.id).toBe('cat-123');
    });

    it('존재하지 않는 ID면 NotFoundException을 던진다', async () => {
      mockCategoriesRepository.findByIdActive.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent')).rejects.toThrow('카테고리를 찾을 수 없습니다');
    });
  });

  describe('update', () => {
    it('카테고리를 수정한다', async () => {
      const dto: UpdateCategoryDto = { name: '수정된 이름' };
      const updated = { ...mockCategory, ...dto };
      mockCategoriesRepository.findById.mockResolvedValue(mockCategory);
      mockCategoriesRepository.save.mockResolvedValue(updated);

      const result = await service.update('cat-123', dto);

      expect(mockCategoriesRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('수정된 이름');
    });

    it('존재하지 않는 ID면 NotFoundException을 던진다', async () => {
      mockCategoriesRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: '이름' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('카테고리를 비활성화한다 (soft delete)', async () => {
      mockCategoriesRepository.findById.mockResolvedValue(mockCategory);
      mockCategoriesRepository.save.mockResolvedValue({ ...mockCategory, isActive: false });

      await service.remove('cat-123');

      expect(mockCategoriesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });

    it('존재하지 않는 ID면 NotFoundException을 던진다', async () => {
      mockCategoriesRepository.findById.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
