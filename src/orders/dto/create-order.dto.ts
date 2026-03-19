import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrderItemDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  optionId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}

export class CreateGuestOrderDto extends CreateOrderDto {
  @IsString()
  @MaxLength(100)
  guestName: string;

  @IsString()
  @MaxLength(255)
  guestEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  guestPhone?: string;
}

export { CreateOrderItemDto };
