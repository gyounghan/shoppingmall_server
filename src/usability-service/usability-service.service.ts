import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsabilityServiceRequest } from './entities/usability-service-request.entity';
import { CreateUsabilityServiceRequestDto } from './dto/create-usability-service-request.dto';
import { UsabilityServiceRequestResponseDto } from './dto/usability-service-request-response.dto';

@Injectable()
export class UsabilityServiceService {
  constructor(
    @InjectRepository(UsabilityServiceRequest)
    private readonly usabilityServiceRequestRepository: Repository<UsabilityServiceRequest>,
  ) {}

  async create(
    userId: string,
    createDto: CreateUsabilityServiceRequestDto,
  ): Promise<UsabilityServiceRequestResponseDto> {
    const request = this.usabilityServiceRequestRepository.create({
      userId,
      title: createDto.title,
      content: createDto.content,
    });
    const saved = await this.usabilityServiceRequestRepository.save(request);
    return new UsabilityServiceRequestResponseDto(saved);
  }

  async findMine(userId: string): Promise<UsabilityServiceRequestResponseDto[]> {
    const rows = await this.usabilityServiceRequestRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return rows.map((row) => new UsabilityServiceRequestResponseDto(row));
  }
}
