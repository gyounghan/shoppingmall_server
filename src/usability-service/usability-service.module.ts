import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsabilityServiceRequest } from './entities/usability-service-request.entity';
import { UsabilityServiceService } from './usability-service.service';
import { UsabilityServiceController } from './usability-service.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UsabilityServiceRequest])],
  providers: [UsabilityServiceService],
  controllers: [UsabilityServiceController],
})
export class UsabilityServiceModule {}
