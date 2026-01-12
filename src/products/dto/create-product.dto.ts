import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  Min,
  Max,
  IsUrl,
} from 'class-validator';
import { ProductTag } from '../../entities/product.entity';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsUrl()
  @IsOptional()
  image?: string;

  @IsEnum(ProductTag)
  @IsOptional()
  tag?: ProductTag;

  @IsString()
  brandId: string;

  @IsString()
  categoryId: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountRate?: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

