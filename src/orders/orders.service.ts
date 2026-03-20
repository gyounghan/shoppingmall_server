import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto, CreateGuestOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrdersRepository } from './repositories/orders.repository';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async create(userId: string | null, createDto: CreateOrderDto): Promise<OrderResponseDto> {
    const productIds = createDto.items.map((item) => item.productId);
    const products = await this.ordersRepository.findProductsByIds(productIds);
    const productMap = new Map(products.map((product) => [product.id, product]));

    const orderItemsPayload = createDto.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(`상품을 찾을 수 없습니다. (ID: ${item.productId})`);
      }
      return {
        productId: item.productId,
        optionId: item.optionId ?? null,
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

    const order = this.ordersRepository.createOrder({
      userId: isGuest ? null : userId,
      guestName: isGuest ? guestDto.guestName : null,
      guestEmail: isGuest ? guestDto.guestEmail : null,
      guestPhone: isGuest ? guestDto.guestPhone : null,
      totalAmount,
      note: createDto.note ?? null,
    });
    const savedOrder = await this.ordersRepository.saveOrder(order);

    const orderItems = orderItemsPayload.map((item) =>
      this.ordersRepository.createOrderItem({ orderId: savedOrder.id, ...item }),
    );
    const savedItems = await this.ordersRepository.saveOrderItems(orderItems);

    const payment = this.ordersRepository.createPayment({
      orderId: savedOrder.id,
      paymentMethod: createDto.paymentMethod,
      amount: totalAmount,
    });
    const savedPayment = await this.ordersRepository.savePayment(payment);

    return new OrderResponseDto(savedOrder, savedItems, savedPayment);
  }

  async findByGuestOrderId(orderId: string, email: string): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findGuestOrder(orderId, email);
    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없거나 이메일이 일치하지 않습니다.');
    }

    const [items, payment] = await Promise.all([
      this.ordersRepository.findItemsByOrderId(orderId),
      this.ordersRepository.findPaymentByOrderId(orderId),
    ]);

    if (!payment) {
      throw new NotFoundException(`결제 정보를 찾을 수 없습니다.`);
    }

    return new OrderResponseDto(order, items, payment);
  }

  async findMine(userId: string): Promise<OrderResponseDto[]> {
    const orders = await this.ordersRepository.findOrdersByUser(userId);

    return Promise.all(
      orders.map(async (order) => {
        const [items, payment] = await Promise.all([
          this.ordersRepository.findItemsByOrderId(order.id),
          this.ordersRepository.findPaymentByOrderId(order.id),
        ]);
        if (!payment) {
          throw new NotFoundException(
            `결제 정보를 찾을 수 없습니다. (orderId: ${order.id})`,
          );
        }
        return new OrderResponseDto(order, items, payment);
      }),
    );
  }
}
