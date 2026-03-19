import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistItem } from './entities/wishlist-item.entity';
import { Product } from '../products/entities/product.entity';

describe('WishlistService', () => {
  let service: WishlistService;

  const mockProduct = {
    id: 'prod-123',
    name: '상품',
    price: 10000,
    isActive: true,
  };

  const mockWishlistItem = {
    id: 'wish-123',
    userId: 'user-123',
    productId: 'prod-123',
    product: mockProduct,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWishlistItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        { provide: getRepositoryToken(WishlistItem), useValue: mockWishlistItemRepository },
        { provide: getRepositoryToken(Product), useValue: mockProductRepository },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addItem', () => {
    it('위시리스트에 상품을 추가한다', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockWishlistItemRepository.findOne
        .mockResolvedValueOnce(null) // 기존 항목 없음
        .mockResolvedValueOnce({ ...mockWishlistItem, product: mockProduct }); // 저장 후 조회
      mockWishlistItemRepository.create.mockReturnValue(mockWishlistItem);
      mockWishlistItemRepository.save.mockResolvedValue(mockWishlistItem);

      const result = await service.addItem('user-123', 'prod-123');

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'prod-123', isActive: true },
      });
      expect(result.productId).toBe('prod-123');
    });

    it('이미 찜한 상품이면 ConflictException을 던진다', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockWishlistItemRepository.findOne.mockResolvedValue(mockWishlistItem);

      await expect(service.addItem('user-123', 'prod-123')).rejects.toThrow(
        ConflictException,
      );
      await expect(service.addItem('user-123', 'prod-123')).rejects.toThrow(
        '이미 찜한 제품입니다',
      );
    });

    it('상품이 없으면 NotFoundException을 던진다', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.addItem('user-123', 'prod-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('사용자 위시리스트를 반환한다', async () => {
      mockWishlistItemRepository.find.mockResolvedValue([mockWishlistItem]);

      const result = await service.findAll('user-123');

      expect(mockWishlistItemRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        relations: ['product'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('remove', () => {
    it('항목을 삭제한다', async () => {
      mockWishlistItemRepository.findOne.mockResolvedValue(mockWishlistItem);

      await service.remove('user-123', 'wish-123');

      expect(mockWishlistItemRepository.remove).toHaveBeenCalledWith(mockWishlistItem);
    });

    it('항목이 없으면 NotFoundException을 던진다', async () => {
      mockWishlistItemRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('user-123', 'wish-123')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('user-123', 'wish-123')).rejects.toThrow(
        '찜 목록 아이템을 찾을 수 없습니다',
      );
    });
  });

  describe('removeByProductId', () => {
    it('상품ID로 항목을 삭제한다', async () => {
      mockWishlistItemRepository.findOne.mockResolvedValue(mockWishlistItem);

      await service.removeByProductId('user-123', 'prod-123');

      expect(mockWishlistItemRepository.remove).toHaveBeenCalledWith(mockWishlistItem);
    });

    it('항목이 없으면 아무것도 하지 않는다', async () => {
      mockWishlistItemRepository.findOne.mockResolvedValue(null);

      await service.removeByProductId('user-123', 'prod-123');

      expect(mockWishlistItemRepository.remove).not.toHaveBeenCalled();
    });
  });
});
