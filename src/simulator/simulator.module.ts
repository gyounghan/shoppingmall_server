import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimulatorSet } from './entities/simulator-set.entity';
import { SimulatorSetItem } from './entities/simulator-set-item.entity';
import { SimulatorService } from './simulator.service';
import { SimulatorController } from './simulator.controller';
import { SimulatorRepository } from './repositories/simulator.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SimulatorSet, SimulatorSetItem])],
  controllers: [SimulatorController],
  providers: [SimulatorService, SimulatorRepository],
  exports: [SimulatorService],
})
export class SimulatorModule {}
