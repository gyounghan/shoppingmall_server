import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Product } from '../../products/entities/product.entity';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  findProductsByIds(productIds: string[]): Promise<Product[]> {
    return this.productRepo.find({ where: { id: In(productIds), isActive: true } });
  }

  createOrder(data: Partial<Order>): Order {
    return this.orderRepo.create(data as Order);
  }

  saveOrder(order: Order): Promise<Order> {
    return this.orderRepo.save(order);
  }

  createOrderItem(data: Partial<OrderItem>): OrderItem {
    return this.orderItemRepo.create(data as OrderItem);
  }

  saveOrderItems(items: OrderItem[]): Promise<OrderItem[]> {
    return this.orderItemRepo.save(items);
  }

  createPayment(data: Partial<Payment>): Payment {
    return this.paymentRepo.create(data as Payment);
  }

  savePayment(payment: Payment): Promise<Payment> {
    return this.paymentRepo.save(payment);
  }

  findGuestOrder(orderId: string, guestEmail: string): Promise<Order | null> {
    return this.orderRepo.findOne({
      where: { id: orderId, userId: IsNull(), guestEmail },
    });
  }

  findOrdersByUser(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  findItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    return this.orderItemRepo.find({ where: { orderId } });
  }

  findPaymentByOrderId(orderId: string): Promise<Payment | null> {
    return this.paymentRepo.findOne({ where: { orderId } });
  }
}
