import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { Product } from './entities/product.entity';
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

  const mockRelatedData = {
    images: [],
    options: [],
    compatibility: [],
    recommendations: [],
  };

  const mockProductsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn().mockResolvedValue([[mockProduct], 1]),
    findAllByCategoryIds: jest.fn().mockResolvedValue([[mockProduct], 1]),
    findRelatedData: jest.fn().mockResolvedValue(mockRelatedData),
    getTopProducts: jest.fn(),
    findMainCategory: jest.fn(),
    findChildCategoryIds: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: mockProductsRepository },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
    mockProductsRepository.findAll.mockResolvedValue([[mockProduct], 1]);
    mockProductsRepository.findAllByCategoryIds.mockResolvedValue([[mockProduct], 1]);
    mockProductsRepository.findRelatedData.mockResolvedValue(mockRelatedData);
    mockProductsRepository.findChildCategoryIds.mockResolvedValue([]);
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
      mockProductsRepository.create.mockReturnValue({ ...mockProduct, ...dto });
      mockProductsRepository.save.mockResolvedValue(mockProduct);

      const result = await service.create(dto);

      expect(mockProductsRepository.create).toHaveBeenCalledWith(
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

      expect(mockProductsRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({}),
      );
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.take).toBe(20);
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

      expect(mockProductsRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ brandId: 'brand-1', categoryId: 'cat-1' }),
      );
    });
  });

  describe('findOne', () => {
    it('상품 상세를 조회하고 viewCount를 증가시킨다', async () => {
      mockProductsRepository.findById.mockResolvedValue(mockProduct);
      mockProductsRepository.save.mockResolvedValue({ ...mockProduct, viewCount: 1 });

      const result = await service.findOne('prod-123');

      expect(mockProductsRepository.findById).toHaveBeenCalledWith('prod-123');
      expect(mockProductsRepository.save).toHaveBeenCalled();
      expect(result.images).toEqual([]);
      expect(result.options).toEqual([]);
      expect(result.compatibilityProducts).toEqual([]);
      expect(result.recommendationProducts).toEqual([]);
    });

    it('존재하지 않는 ID면 NotFoundException을 던진다', async () => {
      mockProductsRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent')).rejects.toThrow('제품을 찾을 수 없습니다');
    });
  });

  describe('update', () => {
    it('상품을 수정한다', async () => {
      const dto: UpdateProductDto = { name: '수정된 상품명' };
      mockProductsRepository.findById.mockResolvedValue(mockProduct);
      mockProductsRepository.save.mockResolvedValue({ ...mockProduct, ...dto });

      const result = await service.update('prod-123', dto);

      expect(mockProductsRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('수정된 상품명');
    });

    it('존재하지 않는 ID면 NotFoundException을 던진다', async () => {
      mockProductsRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: '이름' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('상품을 비활성화한다 (soft delete)', async () => {
      mockProductsRepository.findById.mockResolvedValue(mockProduct);
      mockProductsRepository.save.mockResolvedValue({ ...mockProduct, isActive: false });

      await service.remove('prod-123');

      expect(mockProductsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });
  });

  describe('getTopProducts', () => {
    it('인기 상품 목록을 반환한다', async () => {
      mockProductsRepository.getTopProducts.mockResolvedValue([mockProduct]);

      const result = await service.getTopProducts(5);

      expect(mockProductsRepository.getTopProducts).toHaveBeenCalledWith(5, SortField.SALES_COUNT);
      expect(result).toHaveLength(1);
    });
  });

  describe('getProductsByBrand', () => {
    it('brandId를 추가하여 findAll을 호출한다', async () => {
      const result = await service.getProductsByBrand('brand-1', {});

      expect(mockProductsRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ brandId: 'brand-1' }),
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getProductsByCategory', () => {
    it('categoryId를 추가하여 findAll을 호출한다', async () => {
      const result = await service.getProductsByCategory('cat-1', {});

      expect(mockProductsRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 'cat-1' }),
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getProductsByMainCategory', () => {
    it('메인 카테고리와 자식 카테고리 상품을 반환한다', async () => {
      mockProductsRepository.findMainCategory.mockResolvedValue({ id: 'main-1', name: '메인' });
      mockProductsRepository.findChildCategoryIds.mockResolvedValue(['child-1']);

      const result = await service.getProductsByMainCategory('main-1', {});

      expect(mockProductsRepository.findAllByCategoryIds).toHaveBeenCalledWith(
        ['main-1', 'child-1'],
        expect.any(Object),
      );
      expect(result.data).toHaveLength(1);
    });

    it('메인 카테고리가 없으면 NotFoundException을 던진다', async () => {
      mockProductsRepository.findMainCategory.mockResolvedValue(null);

      await expect(
        service.getProductsByMainCategory('nonexistent', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
