import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { OrderStatus } from '../orders/entities/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { PaymentsRepository } from './repositories/payments.repository';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const { orderId, paymentMethod, amount, meta } = createPaymentDto;

    const order = await this.paymentsRepository.findOrder(orderId);
    if (!order) {
      throw new NotFoundException(`주문(${orderId})을 찾을 수 없습니다.`);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new ConflictException('이미 처리된 주문입니다.');
    }

    const existingPayment = await this.paymentsRepository.findCompletedByOrderId(orderId);
    if (existingPayment) {
      throw new ConflictException('이미 완료된 결제가 존재합니다.');
    }

    if (Number(order.totalAmount) !== amount) {
      throw new BadRequestException(
        `결제 금액(${amount})이 주문 금액(${order.totalAmount})과 일치하지 않습니다.`,
      );
    }

    const payment = this.paymentsRepository.create({
      orderId,
      paymentMethod,
      amount,
      status: PaymentStatus.PENDING,
      meta: meta ?? null,
    });

    const saved = await this.paymentsRepository.save(payment);

    // 결제 완료 처리 (실제 PG사 연동 전 모의 처리)
    await this.complete(saved.id);

    const completed = await this.paymentsRepository.findById(saved.id);
    if (!completed) {
      throw new NotFoundException(`결제(${saved.id})를 찾을 수 없습니다.`);
    }

    return new PaymentResponseDto(completed);
  }

  async complete(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.findPaymentOrFail(paymentId);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new ConflictException('대기 중인 결제만 완료 처리할 수 있습니다.');
    }

    payment.status = PaymentStatus.COMPLETED;
    await this.paymentsRepository.save(payment);

    await this.paymentsRepository.updateOrderStatus(payment.orderId, OrderStatus.PAID);

    return new PaymentResponseDto(payment);
  }

  async findByOrderId(orderId: string): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentsRepository.findByOrderId(orderId);
    return payments.map((p) => new PaymentResponseDto(p));
  }

  async findOne(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.findPaymentOrFail(paymentId);
    return new PaymentResponseDto(payment);
  }

  async refund(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.findPaymentOrFail(paymentId);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new ConflictException('완료된 결제만 환불할 수 있습니다.');
    }

    payment.status = PaymentStatus.REFUNDED;
    await this.paymentsRepository.save(payment);

    await this.paymentsRepository.updateOrderStatus(payment.orderId, OrderStatus.CANCELLED);

    return new PaymentResponseDto(payment);
  }

  private async findPaymentOrFail(paymentId: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException(`결제(${paymentId})를 찾을 수 없습니다.`);
    }
    return payment;
  }
}
