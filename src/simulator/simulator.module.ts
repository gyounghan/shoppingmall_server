import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimulatorSet } from './entities/simulator-set.entity';
import { SimulatorSetItem } from './entities/simulator-set-item.entity';
import { SimulatorService } from './simulator.service';
import { SimulatorController } from './simulator.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SimulatorSet, SimulatorSetItem])],
  controllers: [SimulatorController],
  providers: [SimulatorService],
  exports: [SimulatorService],
})
export class SimulatorModule {}
