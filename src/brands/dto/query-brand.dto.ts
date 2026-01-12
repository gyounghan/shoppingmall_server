import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryBrandDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

