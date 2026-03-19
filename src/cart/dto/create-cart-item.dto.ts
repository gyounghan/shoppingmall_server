import { IsUUID, IsInt, Min, IsOptional } from 'class-validator';

export class CreateCartItemDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  optionId?: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

