import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateSimulatorSetItemDto {
  @IsString()
  productId: string;

  @IsString()
  categoryId: string;
}

export class CreateSimulatorSetDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSimulatorSetItemDto)
  items: CreateSimulatorSetItemDto[];
}

export { CreateSimulatorSetItemDto };
