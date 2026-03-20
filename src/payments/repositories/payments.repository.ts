import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { Order, OrderStatus } from '../../orders/entities/order.entity';

@Injectable()
export class PaymentsRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  create(data: Partial<Payment>): Payment {
    return this.paymentRepo.create(data as Payment);
  }

  save(payment: Payment): Promise<Payment> {
    return this.paymentRepo.save(payment);
  }

  findById(id: string): Promise<Payment | null> {
    return this.paymentRepo.findOne({ where: { id } });
  }

  findByOrderId(orderId: string): Promise<Payment[]> {
    return this.paymentRepo.find({ where: { orderId } });
  }

  findCompletedByOrderId(orderId: string): Promise<Payment | null> {
    return this.paymentRepo.findOne({
      where: { orderId, status: PaymentStatus.COMPLETED },
    });
  }

  findOrder(orderId: string): Promise<Order | null> {
    return this.orderRepo.findOne({ where: { id: orderId } });
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    return this.orderRepo.update({ id: orderId }, { status }).then(() => undefined);
  }
}
