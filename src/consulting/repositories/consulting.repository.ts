import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultingRequest } from '../entities/consulting-request.entity';

@Injectable()
export class ConsultingRepository {
  constructor(
    @InjectRepository(ConsultingRequest)
    private readonly consultingRequestRepo: Repository<ConsultingRequest>,
  ) {}

  create(data: Partial<ConsultingRequest>): ConsultingRequest {
    return this.consultingRequestRepo.create(data as ConsultingRequest);
  }

  save(request: ConsultingRequest): Promise<ConsultingRequest> {
    return this.consultingRequestRepo.save(request);
  }

  findByUser(userId: string): Promise<ConsultingRequest[]> {
    return this.consultingRequestRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
