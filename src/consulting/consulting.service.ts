import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultingRequest } from './entities/consulting-request.entity';
import { CreateConsultingRequestDto } from './dto/create-consulting-request.dto';
import { ConsultingRequestResponseDto } from './dto/consulting-request-response.dto';

@Injectable()
export class ConsultingService {
  constructor(
    @InjectRepository(ConsultingRequest)
    private readonly consultingRequestRepository: Repository<ConsultingRequest>,
  ) {}

  async create(
    userId: string,
    createDto: CreateConsultingRequestDto,
  ): Promise<ConsultingRequestResponseDto> {
    const request = this.consultingRequestRepository.create({
      userId,
      title: createDto.title,
      content: createDto.content,
    });
    const saved = await this.consultingRequestRepository.save(request);
    return new ConsultingRequestResponseDto(saved);
  }

  async findMine(userId: string): Promise<ConsultingRequestResponseDto[]> {
    const rows = await this.consultingRequestRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return rows.map((row) => new ConsultingRequestResponseDto(row));
  }
}
