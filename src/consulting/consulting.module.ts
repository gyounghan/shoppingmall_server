import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultingRequest } from './entities/consulting-request.entity';
import { ConsultingService } from './consulting.service';
import { ConsultingController } from './consulting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConsultingRequest])],
  providers: [ConsultingService],
  controllers: [ConsultingController],
})
export class ConsultingModule {}
