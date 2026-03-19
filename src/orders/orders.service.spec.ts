import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto, CreateGuestOrderDto } from './dto/create-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockProduct = {
    id: 'prod-123',
    price: 10000,
    isActive: true,
  };

  const mockOrder = {
    id: 'order-123',
    userId: 'user-123',
    totalAmount: 20000,
    status: 'PENDING',
    note: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrderItem = {
    id: 'item-123',
    orderId: 'order-123',
    productId: 'prod-123',
    quantity: 2,
    unitPrice: 10000,
  };

  const mockPayment = {
    id: 'pay-123',
    orderId: 'order-123',
    paymentMethod: 'CARD',
    amount: 20000,
    status: 'PENDING',
  };

  const mockOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockOrderItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockPaymentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockProductRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        { provide: getRepositoryToken(OrderItem), useValue: mockOrderItemRepository },
        { provide: getRepositoryToken(Payment), useValue: mockPaymentRepository },
        { provide: getRepositoryToken(Product), useValue: mockProductRepository },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('주문을 생성하고 결제를 등록한다', async () => {
      const dto: CreateOrderDto = {
        items: [{ productId: 'prod-123', quantity: 2 }],
        paymentMethod: 'CARD',
      };
      mockProductRepository.find.mockResolvedValue([mockProduct]);
      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockOrderItemRepository.create.mockImplementation((obj) => obj);
      mockOrderItemRepository.save.mockResolvedValue([mockOrderItem]);
      mockPaymentRepository.create.mockReturnValue(mockPayment);
      mockPaymentRepository.save.mockResolvedValue(mockPayment);

      const result = await service.create('user-123', dto);

      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          id: expect.anything(),
          isActive: true,
        }),
      });
      expect(result.totalAmount).toBe(20000);
      expect(result.payment.paymentMethod).toBe('CARD');
      expect(result.payment.amount).toBe(20000);
      expect(result.items).toHaveLength(1);
    });

    it('존재하지 않는 상품이 있으면 NotFoundException을 던진다', async () => {
      const dto: CreateOrderDto = {
        items: [{ productId: 'nonexistent', quantity: 1 }],
        paymentMethod: 'CARD',
      };
      mockProductRepository.find.mockResolvedValue([]);

      await expect(service.create('user-123', dto)).rejects.toThrow(NotFoundException);
      await expect(service.create('user-123', dto)).rejects.toThrow(
        '상품을 찾을 수 없습니다',
      );
    });

    it('비회원 주문 시 guest 정보로 생성한다', async () => {
      const dto: CreateGuestOrderDto = {
        guestName: '비회원',
        guestEmail: 'guest@test.com',
        guestPhone: '010-1234-5678',
        items: [{ productId: 'prod-123', quantity: 1 }],
        paymentMethod: 'CARD',
      };
      const guestOrder = {
        ...mockOrder,
        userId: null,
        totalAmount: 10000,
        guestName: '비회원',
        guestEmail: 'guest@test.com',
        guestPhone: '010-1234-5678',
      };
      mockProductRepository.find.mockResolvedValue([mockProduct]);
      mockOrderRepository.create.mockReturnValue(guestOrder);
      mockOrderRepository.save.mockResolvedValue(guestOrder);
      mockOrderItemRepository.create.mockImplementation((obj) => obj);
      mockOrderItemRepository.save.mockResolvedValue([mockOrderItem]);
      mockPaymentRepository.create.mockReturnValue(mockPayment);
      mockPaymentRepository.save.mockResolvedValue(mockPayment);

      const result = await service.create(null, dto);

      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          guestName: '비회원',
          guestEmail: 'guest@test.com',
          guestPhone: '010-1234-5678',
        }),
      );
      expect(result.totalAmount).toBe(10000);
    });
  });

  describe('findByGuestOrderId', () => {
    it('이메일이 일치하는 비회원 주문을 조회한다', async () => {
      const guestOrder = {
        ...mockOrder,
        userId: null,
        guestEmail: 'guest@test.com',
      };
      mockOrderRepository.findOne.mockResolvedValue(guestOrder);
      mockOrderItemRepository.find.mockResolvedValue([mockOrderItem]);
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);

      const result = await service.findByGuestOrderId('order-123', 'guest@test.com');

      expect(result.id).toBe('order-123');
      expect(result.guestEmail).toBe('guest@test.com');
    });

    it('이메일이 일치하지 않으면 NotFoundException을 던진다', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findByGuestOrderId('order-123', 'wrong@test.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findMine', () => {
    it('사용자의 주문 목록을 반환한다', async () => {
      mockOrderRepository.find.mockResolvedValue([mockOrder]);
      mockOrderItemRepository.find.mockResolvedValue([mockOrderItem]);
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);

      const result = await service.findMine('user-123');

      expect(mockOrderRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('order-123');
    });
  });
});
