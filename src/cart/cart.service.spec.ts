import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductOption } from '../products/entities/product-option.entity';
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
  } as CartItem;

  const mockCartItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
  };

  const mockProductOptionRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(CartItem), useValue: mockCartItemRepository },
        { provide: getRepositoryToken(Product), useValue: mockProductRepository },
        {
          provide: getRepositoryToken(ProductOption),
          useValue: mockProductOptionRepository,
        },
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
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockCartItemRepository.findOne.mockResolvedValue(null);
      mockCartItemRepository.create.mockReturnValue(mockCartItem);
      mockCartItemRepository.save.mockResolvedValue(mockCartItem);
      mockCartItemRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ ...mockCartItem, product: mockProduct, option: null });

      const result = await service.addItem('user-123', dto);

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'prod-123', isActive: true },
      });
      expect(mockCartItemRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        productId: 'prod-123',
        optionId: undefined,
        quantity: 2,
      });
      expect(result.quantity).toBe(2);
    });

    it('기존 항목이 있으면 수량을 증가시킨다', async () => {
      const dto: CreateCartItemDto = { productId: 'prod-123', quantity: 1 };
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockCartItemRepository.findOne
        .mockResolvedValueOnce({ ...mockCartItem, quantity: 2 })
        .mockResolvedValueOnce({ ...mockCartItem, quantity: 3 });
      mockCartItemRepository.save.mockResolvedValue({ ...mockCartItem, quantity: 3 });

      const result = await service.addItem('user-123', dto);

      expect(mockCartItemRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 3 }),
      );
    });

    it('상품이 없으면 NotFoundException을 던진다', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

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
      mockCartItemRepository.find.mockResolvedValue([mockCartItem]);

      const result = await service.findAll('user-123');

      expect(mockCartItemRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        relations: ['product', 'option'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('수량을 수정한다', async () => {
      const dto: UpdateCartItemDto = { quantity: 5 };
      mockCartItemRepository.findOne.mockResolvedValue(mockCartItem);
      mockCartItemRepository.save.mockResolvedValue({ ...mockCartItem, quantity: 5 });

      const result = await service.update('user-123', 'cart-123', dto);

      expect(result.quantity).toBe(5);
    });

    it('항목이 없으면 NotFoundException을 던진다', async () => {
      mockCartItemRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('user-123', 'cart-123', { quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('항목을 삭제한다', async () => {
      mockCartItemRepository.findOne.mockResolvedValue(mockCartItem);

      await service.remove('user-123', 'cart-123');

      expect(mockCartItemRepository.remove).toHaveBeenCalledWith(mockCartItem);
    });

    it('항목이 없으면 NotFoundException을 던진다', async () => {
      mockCartItemRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('user-123', 'cart-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('clear', () => {
    it('사용자 장바구니를 비운다', async () => {
      await service.clear('user-123');

      expect(mockCartItemRepository.delete).toHaveBeenCalledWith({
        userId: 'user-123',
      });
    });
  });
});
