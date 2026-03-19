import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: Repository<Category>;

  const mockCategory: Category = {
    id: 'cat-123',
    name: '피시 finder',
    description: '물고기 탐지기',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockCategory], 1]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<Repository<Category>>(getRepositoryToken(Category));
    jest.clearAllMocks();
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
      mockRepository.create.mockReturnValue({ ...mockCategory, ...dto });
      mockRepository.save.mockResolvedValue(mockCategory);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dto,
        isActive: true,
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(mockCategory.id);
      expect(result.name).toBe(mockCategory.name);
    });

    it('isActive 미지정 시 true로 생성한다', async () => {
      const dto: CreateCategoryDto = { name: '카테고리' };
      mockRepository.create.mockReturnValue({ ...mockCategory });
      mockRepository.save.mockResolvedValue(mockCategory);

      await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
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
      mockRepository.findOne.mockResolvedValue(mockCategory);

      const result = await service.findOne('cat-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'cat-123', isActive: true },
      });
      expect(result.id).toBe('cat-123');
    });

    it('존재하지 않는 ID면 NotFoundException을 던진다', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent')).rejects.toThrow('카테고리를 찾을 수 없습니다');
    });
  });

  describe('update', () => {
    it('카테고리를 수정한다', async () => {
      const dto: UpdateCategoryDto = { name: '수정된 이름' };
      const updated = { ...mockCategory, ...dto };
      mockRepository.findOne.mockResolvedValue(mockCategory);
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.update('cat-123', dto);

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('수정된 이름');
    });

    it('존재하지 않는 ID면 NotFoundException을 던진다', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: '이름' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('카테고리를 비활성화한다 (soft delete)', async () => {
      mockRepository.findOne.mockResolvedValue(mockCategory);
      mockRepository.save.mockResolvedValue({ ...mockCategory, isActive: false });

      await service.remove('cat-123');

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });

    it('존재하지 않는 ID면 NotFoundException을 던진다', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
