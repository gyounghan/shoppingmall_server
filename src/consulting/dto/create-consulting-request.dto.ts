import { IsString, MaxLength } from 'class-validator';

export class CreateConsultingRequestDto {
  @IsString()
  @MaxLength(150)
  title: string;

  @IsString()
  content: string;
}
