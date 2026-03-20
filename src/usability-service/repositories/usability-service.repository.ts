import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsabilityServiceRequest } from '../entities/usability-service-request.entity';

@Injectable()
export class UsabilityServiceRepository {
  constructor(
    @InjectRepository(UsabilityServiceRequest)
    private readonly usabilityServiceRequestRepo: Repository<UsabilityServiceRequest>,
  ) {}

  create(data: Partial<UsabilityServiceRequest>): UsabilityServiceRequest {
    return this.usabilityServiceRequestRepo.create(
      data as UsabilityServiceRequest,
    );
  }

  save(request: UsabilityServiceRequest): Promise<UsabilityServiceRequest> {
    return this.usabilityServiceRequestRepo.save(request);
  }

  findByUser(userId: string): Promise<UsabilityServiceRequest[]> {
    return this.usabilityServiceRequestRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
