import { Injectable } from '@nestjs/common';
import { CreateConsultingRequestDto } from './dto/create-consulting-request.dto';
import { ConsultingRequestResponseDto } from './dto/consulting-request-response.dto';
import { ConsultingRepository } from './repositories/consulting.repository';

@Injectable()
export class ConsultingService {
  constructor(private readonly consultingRepository: ConsultingRepository) {}

  async create(
    userId: string,
    createDto: CreateConsultingRequestDto,
  ): Promise<ConsultingRequestResponseDto> {
    const request = this.consultingRepository.create({
      userId,
      title: createDto.title,
      content: createDto.content,
    });
    const saved = await this.consultingRepository.save(request);
    return new ConsultingRequestResponseDto(saved);
  }

  async findMine(userId: string): Promise<ConsultingRequestResponseDto[]> {
    const rows = await this.consultingRepository.findByUser(userId);
    return rows.map((row) => new ConsultingRequestResponseDto(row));
  }
}
