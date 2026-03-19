import { PartialType } from '@nestjs/mapped-types';
import { CreateSimulatorSetDto } from './create-simulator-set.dto';

export class UpdateSimulatorSetDto extends PartialType(CreateSimulatorSetDto) {}
