import { IsString, MaxLength } from 'class-validator';

export class CreateUsabilityServiceRequestDto {
  @IsString()
  @MaxLength(150)
  title: string;

  @IsString()
  content: string;
}
