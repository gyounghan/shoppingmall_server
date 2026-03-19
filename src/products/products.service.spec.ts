import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductOption } from './entities/product-option.entity';
import { ProductCompatibility } from './entities/product-compatibility.entity';
import { ProductRecommendation } from './entities/product-recommendation.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SortField, SortOrder } from './dto/query-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProduct: Product = {
    id: 'prod-123',
    name: '상품명',
    description: '설명',
    htmlDescription: null,
    price: 299000,
    image: 'https://example.com/img.jpg',
    tag: null,
    brandId: 'brand-1',
    categoryId: 'cat-1',
    stock: 10,
    discountRate: 0,
    rating: 0,
    reviewCount: 0,
    viewCount: 0,
    salesCount: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
  };

  const mockProductRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockProductImageRepo = {
    find: jest.fn().mockResolvedValue([]),
  };

  const mockProductOptionRepo = {
    find: jest.fn().mockResolvedValue([]),
  };

  const mockCompatibilityRepo = {
    find: jest.fn().mockResolvedValue([]),
  };

  const mockRecommendationRepo = {
    find: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
        { provide: getRepositoryToken(ProductImage), useValue: mockProductImageRepo },
        { provide: getRepositoryToken(ProductOption), useValue: mockProductOptionRepo },
        { provide: getRepositoryToken(ProductCompatibility), useValue: mockCompatibilityRepo },
        { provide: getRepositoryToken(ProductRecommendation), useValue: mockRecommendationRepo },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('상품을 생성한다', async () => {
      const dto: CreateProductDto = {
        name: '상품명',
        price: 299000,
        brandId: 'brand-1',
        categoryId: 'cat-1',
      };
      mockProductRepo.create.mockReturnValue({ ...mockProduct, ...dto });
      mockProductRepo.save.mockResolvedValue(mockProduct);

      const result = await service.create(dto);

      expect(mockProductRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
          price: dto.price,
          stock: 0,
          discountRate: 0,
          rating: 0,
          isActive: true,
        }),
      );
      expect(result.id).toBe(mockProduct.id);
    });
  });

  describe('findAll', () => {
    it('페이지네이션된 상품 목록을 반환한다', async () => {
      const result = await service.findAll({});

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.take).toBe(20);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.isActive = :isActive',
        { isActive: true },
      );
    });

    it('필터 조건을 적용한다', async () => {
      await service.findAll({
        brandId: 'brand-1',
        categoryId: 'cat-1',
        tag: 'BEST' as any,
        search: '검색어',
        minPrice: 10000,
        maxPrice: 500000,
        sortBy: SortField.PRICE,
        sortOrder: SortOrder.ASC,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.brandId = :brandId',
        { brandId: 'brand-1' },
      );
    });
  });

  describe('findOne', () => {
    it('상품 상세를 조회하고 viewCount를 증가시킨다', async () => {
      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockProductRepo.save.mockResolvedValue({ ...mockProduct, viewCount: 1 });

      const result = await service.findOne('prod-123');

      expect(mockProductRepo.findOne).toHaveBeenCalledWith({ where: { id: 'prod-123' } });
      expect(mockProductRepo.save).toHaveBeenCalled();
      expect(result.images).toEqual([]);
      expect(result.options).toEqual([]);
      expect(result.compatibilityProducts).toEqual([]);
      expect(result.recommendationProducts).toEqual([]);
    });

    it('존재하지 않는 ID면 NotFoundException을 던진다', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent')).rejects.toThrow('제품을 찾을 수 없습니다');
    });
  });

  describe('update', () => {
    it('상품을 수정한다', async () => {
      const dto: UpdateProductDto = { name: '수정된 상품명' };
      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockProductRepo.save.mockResolvedValue({ ...mockProduct, ...dto });

      const result = await service.update('prod-123', dto);

      expect(mockProductRepo.save).toHaveBeenCalled();
      expect(result.name).toBe('수정된 상품명');
    });

    it('존재하지 않는 ID면 NotFoundException을 던진다', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: '이름' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('상품을 비활성화한다 (soft delete)', async () => {
      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockProductRepo.save.mockResolvedValue({ ...mockProduct, isActive: false });

      await service.remove('prod-123');

      expect(mockProductRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });
  });

  describe('getTopProducts', () => {
    it('인기 상품 목록을 반환한다', async () => {
      mockProductRepo.find.mockResolvedValue([mockProduct]);

      const result = await service.getTopProducts(5);

      expect(mockProductRepo.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { salesCount: 'DESC' },
        take: 5,
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getProductsByBrand', () => {
    it('brandId를 추가하여 findAll을 호출한다', async () => {
      const result = await service.getProductsByBrand('brand-1', {});

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.brandId = :brandId',
        { brandId: 'brand-1' },
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getProductsByCategory', () => {
    it('categoryId를 추가하여 findAll을 호출한다', async () => {
      const result = await service.getProductsByCategory('cat-1', {});

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.categoryId = :categoryId',
        { categoryId: 'cat-1' },
      );
      expect(result.data).toHaveLength(1);
    });
  });
});
