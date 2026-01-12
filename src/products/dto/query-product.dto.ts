import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductTag } from '../../entities/product.entity';

export enum SortField {
  PRICE = 'price',
  CREATED_AT = 'createdAt',
  RATING = 'rating',
  SALES_COUNT = 'salesCount',
  VIEW_COUNT = 'viewCount',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryProductDto {
  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(ProductTag)
  tag?: ProductTag;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minRating?: number;

  @IsOptional()
  @IsEnum(SortField)
  sortBy?: SortField;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;
}

