import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistRepository } from './repositories/wishlist.repository';

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

  const mockWishlistRepository = {
    findProduct: jest.fn(),
    findExisting: jest.fn(),
    findByUser: jest.fn(),
    findOneById: jest.fn(),
    findOneByIdWithRelations: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        { provide: WishlistRepository, useValue: mockWishlistRepository },
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
      mockWishlistRepository.findProduct.mockResolvedValue(mockProduct);
      mockWishlistRepository.findExisting.mockResolvedValue(null);
      mockWishlistRepository.create.mockReturnValue(mockWishlistItem);
      mockWishlistRepository.save.mockResolvedValue(mockWishlistItem);
      mockWishlistRepository.findOneByIdWithRelations.mockResolvedValue({
        ...mockWishlistItem,
        product: mockProduct,
      });

      const result = await service.addItem('user-123', 'prod-123');

      expect(mockWishlistRepository.findProduct).toHaveBeenCalledWith('prod-123');
      expect(result.productId).toBe('prod-123');
    });

    it('이미 찜한 상품이면 ConflictException을 던진다', async () => {
      mockWishlistRepository.findProduct.mockResolvedValue(mockProduct);
      mockWishlistRepository.findExisting.mockResolvedValue(mockWishlistItem);

      await expect(service.addItem('user-123', 'prod-123')).rejects.toThrow(
        ConflictException,
      );
      await expect(service.addItem('user-123', 'prod-123')).rejects.toThrow(
        '이미 찜한 제품입니다',
      );
    });

    it('상품이 없으면 NotFoundException을 던진다', async () => {
      mockWishlistRepository.findProduct.mockResolvedValue(null);

      await expect(service.addItem('user-123', 'prod-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('사용자 위시리스트를 반환한다', async () => {
      mockWishlistRepository.findByUser.mockResolvedValue([mockWishlistItem]);

      const result = await service.findAll('user-123');

      expect(mockWishlistRepository.findByUser).toHaveBeenCalledWith('user-123');
      expect(result).toHaveLength(1);
    });
  });

  describe('remove', () => {
    it('항목을 삭제한다', async () => {
      mockWishlistRepository.findOneById.mockResolvedValue(mockWishlistItem);

      await service.remove('user-123', 'wish-123');

      expect(mockWishlistRepository.remove).toHaveBeenCalledWith(mockWishlistItem);
    });

    it('항목이 없으면 NotFoundException을 던진다', async () => {
      mockWishlistRepository.findOneById.mockResolvedValue(null);

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
      mockWishlistRepository.findExisting.mockResolvedValue(mockWishlistItem);

      await service.removeByProductId('user-123', 'prod-123');

      expect(mockWishlistRepository.remove).toHaveBeenCalledWith(mockWishlistItem);
    });

    it('항목이 없으면 아무것도 하지 않는다', async () => {
      mockWishlistRepository.findExisting.mockResolvedValue(null);

      await service.removeByProductId('user-123', 'prod-123');

      expect(mockWishlistRepository.remove).not.toHaveBeenCalled();
    });
  });
});
