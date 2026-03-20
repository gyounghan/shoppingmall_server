import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsabilityServiceRequest } from './entities/usability-service-request.entity';
import { UsabilityServiceService } from './usability-service.service';
import { UsabilityServiceController } from './usability-service.controller';
import { UsabilityServiceRepository } from './repositories/usability-service.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UsabilityServiceRequest])],
  providers: [UsabilityServiceService, UsabilityServiceRepository],
  controllers: [UsabilityServiceController],
})
export class UsabilityServiceModule {}
