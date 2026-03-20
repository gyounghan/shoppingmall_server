import { Payment, PaymentStatus } from '../entities/payment.entity';
import { PaymentMethod } from '../enums/payment-method.enum';

export class PaymentResponseDto {
  id: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  meta: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(payment: Payment) {
    this.id = payment.id;
    this.orderId = payment.orderId;
    this.paymentMethod = payment.paymentMethod as PaymentMethod;
    this.amount = Number(payment.amount);
    this.status = payment.status;
    this.meta = payment.meta;
    this.createdAt = payment.createdAt;
    this.updatedAt = payment.updatedAt;
  }
}
