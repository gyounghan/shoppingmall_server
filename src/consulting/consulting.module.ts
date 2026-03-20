import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultingRequest } from './entities/consulting-request.entity';
import { ConsultingService } from './consulting.service';
import { ConsultingController } from './consulting.controller';
import { ConsultingRepository } from './repositories/consulting.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ConsultingRequest])],
  providers: [ConsultingService, ConsultingRepository],
  controllers: [ConsultingController],
})
export class ConsultingModule {}
