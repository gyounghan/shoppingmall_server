import { Injectable } from '@nestjs/common';
import { CreateUsabilityServiceRequestDto } from './dto/create-usability-service-request.dto';
import { UsabilityServiceRequestResponseDto } from './dto/usability-service-request-response.dto';
import { UsabilityServiceRepository } from './repositories/usability-service.repository';

@Injectable()
export class UsabilityServiceService {
  constructor(
    private readonly usabilityServiceRepository: UsabilityServiceRepository,
  ) {}

  async create(
    userId: string,
    createDto: CreateUsabilityServiceRequestDto,
  ): Promise<UsabilityServiceRequestResponseDto> {
    const request = this.usabilityServiceRepository.create({
      userId,
      title: createDto.title,
      content: createDto.content,
    });
    const saved = await this.usabilityServiceRepository.save(request);
    return new UsabilityServiceRequestResponseDto(saved);
  }

  async findMine(userId: string): Promise<UsabilityServiceRequestResponseDto[]> {
    const rows = await this.usabilityServiceRepository.findByUser(userId);
    return rows.map((row) => new UsabilityServiceRequestResponseDto(row));
  }
}
