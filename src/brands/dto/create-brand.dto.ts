import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug는 소문자, 숫자, 하이픈만 사용할 수 있습니다.',
  })
  slug: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @IsString()
  @IsOptional()
  gradientColor?: string;

  @IsBoolean()
  @IsOptional()
  hasLogo?: boolean;

  @IsBoolean()
  @IsOptional()
  hasOverlay?: boolean;
}

