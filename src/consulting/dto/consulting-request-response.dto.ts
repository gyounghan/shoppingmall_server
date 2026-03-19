import {
  ConsultingRequest,
  ConsultingRequestStatus,
} from '../entities/consulting-request.entity';

export class ConsultingRequestResponseDto {
  id: string;
  userId: string;
  title: string;
  content: string;
  status: ConsultingRequestStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(request: ConsultingRequest) {
    this.id = request.id;
    this.userId = request.userId;
    this.title = request.title;
    this.content = request.content;
    this.status = request.status;
    this.createdAt = request.createdAt;
    this.updatedAt = request.updatedAt;
  }
}
