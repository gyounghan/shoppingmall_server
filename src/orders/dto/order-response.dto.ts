import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Payment, PaymentStatus } from '../../payments/entities/payment.entity';

export class OrderResponseDto {
  id: string;
  userId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  totalAmount: number;
  status: OrderStatus;
  note: string | null;
  items: {
    id: string;
    productId: string;
    optionId: string | null;
    quantity: number;
    unitPrice: number;
  }[];
  payment: {
    id: string;
    paymentMethod: string;
    amount: number;
    status: PaymentStatus;
  };
  createdAt: Date;
  updatedAt: Date;

  constructor(order: Order, items: OrderItem[], payment: Payment) {
    this.id = order.id;
    this.userId = order.userId ?? undefined;
    this.guestName = order.guestName ?? undefined;
    this.guestEmail = order.guestEmail ?? undefined;
    this.guestPhone = order.guestPhone ?? undefined;
    this.totalAmount = Number(order.totalAmount);
    this.status = order.status;
    this.note = order.note;
    this.items = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      optionId: item.optionId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    }));
    this.payment = {
      id: payment.id,
      paymentMethod: payment.paymentMethod,
      amount: Number(payment.amount),
      status: payment.status,
    };
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
  }
}
