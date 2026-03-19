import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto, CreateGuestOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(userId: string | null, createDto: CreateOrderDto): Promise<OrderResponseDto> {
    const productIds = createDto.items.map((item) => item.productId);
    const products = await this.productRepository.find({
      where: { id: In(productIds), isActive: true },
    });
    const productMap = new Map(products.map((product) => [product.id, product]));

    const orderItemsPayload = createDto.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(`상품을 찾을 수 없습니다. (ID: ${item.productId})`);
      }
      return {
        productId: item.productId,
        optionId: item.optionId,
        quantity: item.quantity,
        unitPrice: Number(product.price),
      };
    });

    const totalAmount = orderItemsPayload.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0,
    );

    const isGuest = userId === null;
    const guestDto = createDto as CreateGuestOrderDto;

    const order = this.orderRepository.create({
      userId: isGuest ? undefined : userId,
      guestName: isGuest ? guestDto.guestName : undefined,
      guestEmail: isGuest ? guestDto.guestEmail : undefined,
      guestPhone: isGuest ? guestDto.guestPhone : undefined,
      totalAmount,
      note: createDto.note,
    });
    const savedOrder = await this.orderRepository.save(order);

    const orderItems = orderItemsPayload.map((item) =>
      this.orderItemRepository.create({
        orderId: savedOrder.id,
        ...item,
      }),
    );
    const savedItems = await this.orderItemRepository.save(orderItems);

    const payment = this.paymentRepository.create({
      orderId: savedOrder.id,
      paymentMethod: createDto.paymentMethod,
      amount: totalAmount,
    });
    const savedPayment = await this.paymentRepository.save(payment);

    return new OrderResponseDto(savedOrder, savedItems, savedPayment);
  }

  async findByGuestOrderId(orderId: string, email: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId: IsNull(), guestEmail: email },
    });
    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없거나 이메일이 일치하지 않습니다.');
    }
    const [items, payment] = await Promise.all([
      this.orderItemRepository.find({ where: { orderId } }),
      this.paymentRepository.findOne({ where: { orderId } }),
    ]);
    if (!payment) {
      throw new NotFoundException(`결제 정보를 찾을 수 없습니다.`);
    }
    return new OrderResponseDto(order, items, payment);
  }

  async findMine(userId: string): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      orders.map(async (order) => {
        const [items, payment] = await Promise.all([
          this.orderItemRepository.find({ where: { orderId: order.id } }),
          this.paymentRepository.findOne({ where: { orderId: order.id } }),
        ]);
        if (!payment) {
          throw new NotFoundException(`결제 정보를 찾을 수 없습니다. (orderId: ${order.id})`);
        }
        return new OrderResponseDto(order, items, payment);
      }),
    );
  }
}
