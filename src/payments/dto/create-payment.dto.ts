import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';

export class CreatePaymentDto {
  @IsNotEmpty({ message: '주문 ID는 필수입니다.' })
  @IsString()
  orderId: string;

  @IsEnum(PaymentMethod, { message: '올바른 결제 수단을 선택해주세요.' })
  paymentMethod: PaymentMethod;

  @IsNumber()
  @Min(1, { message: '결제 금액은 1원 이상이어야 합니다.' })
  amount: number;

  @IsOptional()
  meta?: Record<string, unknown>;
}
