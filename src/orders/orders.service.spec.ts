import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './repositories/orders.repository';
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
    guestName: null,
    guestEmail: null,
    guestPhone: null,
    totalAmount: 20000,
    status: 'PENDING',
    note: null,
    user: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrderItem = {
    id: 'item-123',
    orderId: 'order-123',
    productId: 'prod-123',
    optionId: null,
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

  const mockOrdersRepository = {
    findProductsByIds: jest.fn(),
    createOrder: jest.fn(),
    saveOrder: jest.fn(),
    createOrderItem: jest.fn(),
    saveOrderItems: jest.fn(),
    createPayment: jest.fn(),
    savePayment: jest.fn(),
    findGuestOrder: jest.fn(),
    findOrdersByUser: jest.fn(),
    findItemsByOrderId: jest.fn(),
    findPaymentByOrderId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: mockOrdersRepository },
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
      mockOrdersRepository.findProductsByIds.mockResolvedValue([mockProduct]);
      mockOrdersRepository.createOrder.mockReturnValue(mockOrder);
      mockOrdersRepository.saveOrder.mockResolvedValue(mockOrder);
      mockOrdersRepository.createOrderItem.mockImplementation((obj) => obj);
      mockOrdersRepository.saveOrderItems.mockResolvedValue([mockOrderItem]);
      mockOrdersRepository.createPayment.mockReturnValue(mockPayment);
      mockOrdersRepository.savePayment.mockResolvedValue(mockPayment);

      const result = await service.create('user-123', dto);

      expect(mockOrdersRepository.findProductsByIds).toHaveBeenCalledWith(['prod-123']);
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
      mockOrdersRepository.findProductsByIds.mockResolvedValue([]);

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
      mockOrdersRepository.findProductsByIds.mockResolvedValue([mockProduct]);
      mockOrdersRepository.createOrder.mockReturnValue(guestOrder);
      mockOrdersRepository.saveOrder.mockResolvedValue(guestOrder);
      mockOrdersRepository.createOrderItem.mockImplementation((obj) => obj);
      mockOrdersRepository.saveOrderItems.mockResolvedValue([mockOrderItem]);
      mockOrdersRepository.createPayment.mockReturnValue(mockPayment);
      mockOrdersRepository.savePayment.mockResolvedValue(mockPayment);

      const result = await service.create(null, dto);

      expect(mockOrdersRepository.createOrder).toHaveBeenCalledWith(
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
      const guestOrder = { ...mockOrder, userId: null, guestEmail: 'guest@test.com' };
      mockOrdersRepository.findGuestOrder.mockResolvedValue(guestOrder);
      mockOrdersRepository.findItemsByOrderId.mockResolvedValue([mockOrderItem]);
      mockOrdersRepository.findPaymentByOrderId.mockResolvedValue(mockPayment);

      const result = await service.findByGuestOrderId('order-123', 'guest@test.com');

      expect(result.id).toBe('order-123');
      expect(result.guestEmail).toBe('guest@test.com');
    });

    it('이메일이 일치하지 않으면 NotFoundException을 던진다', async () => {
      mockOrdersRepository.findGuestOrder.mockResolvedValue(null);

      await expect(
        service.findByGuestOrderId('order-123', 'wrong@test.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findMine', () => {
    it('사용자의 주문 목록을 반환한다', async () => {
      mockOrdersRepository.findOrdersByUser.mockResolvedValue([mockOrder]);
      mockOrdersRepository.findItemsByOrderId.mockResolvedValue([mockOrderItem]);
      mockOrdersRepository.findPaymentByOrderId.mockResolvedValue(mockPayment);

      const result = await service.findMine('user-123');

      expect(mockOrdersRepository.findOrdersByUser).toHaveBeenCalledWith('user-123');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('order-123');
    });
  });
});
