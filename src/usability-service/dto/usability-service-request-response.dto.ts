import {
  UsabilityServiceRequest,
  UsabilityServiceRequestStatus,
} from '../entities/usability-service-request.entity';

export class UsabilityServiceRequestResponseDto {
  id: string;
  userId: string;
  title: string;
  content: string;
  status: UsabilityServiceRequestStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(request: UsabilityServiceRequest) {
    this.id = request.id;
    this.userId = request.userId;
    this.title = request.title;
    this.content = request.content;
    this.status = request.status;
    this.createdAt = request.createdAt;
    this.updatedAt = request.updatedAt;
  }
}
