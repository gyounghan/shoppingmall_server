import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartRepository } from './repositories/cart.repository';
import { CartItem } from './entities/cart-item.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

describe('CartService', () => {
  let service: CartService;

  const mockProduct = {
    id: 'prod-123',
    name: '상품',
    price: 10000,
    isActive: true,
  };

  const mockCartItem = {
    id: 'cart-123',
    userId: 'user-123',
    productId: 'prod-123',
    optionId: null,
    quantity: 2,
    product: mockProduct,
    option: null,
    user: {} as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as CartItem;

  const mockCartRepository = {
    findProduct: jest.fn(),
    findOption: jest.fn(),
    findExisting: jest.fn(),
    findByUser: jest.fn(),
    findOneById: jest.fn(),
    findOneByIdForDelete: jest.fn(),
    findOneByIdWithRelations: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    deleteByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: CartRepository, useValue: mockCartRepository },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addItem', () => {
    it('새 장바구니 항목을 추가한다', async () => {
      const dto: CreateCartItemDto = { productId: 'prod-123', quantity: 2 };
      mockCartRepository.findProduct.mockResolvedValue(mockProduct);
      mockCartRepository.findExisting.mockResolvedValue(null);
      mockCartRepository.create.mockReturnValue(mockCartItem);
      mockCartRepository.save.mockResolvedValue(mockCartItem);
      mockCartRepository.findOneByIdWithRelations.mockResolvedValue({
        ...mockCartItem,
        product: mockProduct,
        option: null,
      });

      const result = await service.addItem('user-123', dto);

      expect(mockCartRepository.findProduct).toHaveBeenCalledWith('prod-123');
      expect(mockCartRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        productId: 'prod-123',
        optionId: null,
        quantity: 2,
      });
      expect(result.quantity).toBe(2);
    });

    it('기존 항목이 있으면 수량을 증가시킨다', async () => {
      const dto: CreateCartItemDto = { productId: 'prod-123', quantity: 1 };
      mockCartRepository.findProduct.mockResolvedValue(mockProduct);
      mockCartRepository.findExisting.mockResolvedValue({ ...mockCartItem, quantity: 2 });
      mockCartRepository.save.mockResolvedValue({ ...mockCartItem, quantity: 3 });

      const result = await service.addItem('user-123', dto);

      expect(mockCartRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 3 }),
      );
    });

    it('상품이 없으면 NotFoundException을 던진다', async () => {
      mockCartRepository.findProduct.mockResolvedValue(null);

      await expect(
        service.addItem('user-123', { productId: 'prod-123', quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.addItem('user-123', { productId: 'prod-123', quantity: 1 }),
      ).rejects.toThrow('제품을 찾을 수 없습니다');
    });
  });

  describe('findAll', () => {
    it('사용자 장바구니 목록을 반환한다', async () => {
      mockCartRepository.findByUser.mockResolvedValue([mockCartItem]);

      const result = await service.findAll('user-123');

      expect(mockCartRepository.findByUser).toHaveBeenCalledWith('user-123');
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('수량을 수정한다', async () => {
      const dto: UpdateCartItemDto = { quantity: 5 };
      mockCartRepository.findOneById.mockResolvedValue(mockCartItem);
      mockCartRepository.save.mockResolvedValue({ ...mockCartItem, quantity: 5 });

      const result = await service.update('user-123', 'cart-123', dto);

      expect(result.quantity).toBe(5);
    });

    it('항목이 없으면 NotFoundException을 던진다', async () => {
      mockCartRepository.findOneById.mockResolvedValue(null);

      await expect(
        service.update('user-123', 'cart-123', { quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('항목을 삭제한다', async () => {
      mockCartRepository.findOneByIdForDelete.mockResolvedValue(mockCartItem);

      await service.remove('user-123', 'cart-123');

      expect(mockCartRepository.remove).toHaveBeenCalledWith(mockCartItem);
    });

    it('항목이 없으면 NotFoundException을 던진다', async () => {
      mockCartRepository.findOneByIdForDelete.mockResolvedValue(null);

      await expect(service.remove('user-123', 'cart-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('clear', () => {
    it('사용자 장바구니를 비운다', async () => {
      await service.clear('user-123');

      expect(mockCartRepository.deleteByUser).toHaveBeenCalledWith('user-123');
    });
  });
});
