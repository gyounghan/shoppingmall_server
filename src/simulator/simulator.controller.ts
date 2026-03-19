import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SimulatorService } from './simulator.service';
import { CreateSimulatorSetDto } from './dto/create-simulator-set.dto';
import { UpdateSimulatorSetDto } from './dto/update-simulator-set.dto';
import { QuerySimulatorSetDto } from './dto/query-simulator-set.dto';
import {
  PaginatedSimulatorSetResponseDto,
  SimulatorSetResponseDto,
} from './dto/simulator-set-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('simulator/sets')
@UseGuards(JwtAuthGuard)
export class SimulatorController {
  constructor(private readonly simulatorService: SimulatorService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req,
    @Body() createDto: CreateSimulatorSetDto,
  ): Promise<SimulatorSetResponseDto> {
    return this.simulatorService.create(req.user.id, createDto);
  }

  @Get()
  async findAll(
    @Request() req,
    @Query() queryDto: QuerySimulatorSetDto,
  ): Promise<PaginatedSimulatorSetResponseDto> {
    return this.simulatorService.findAll(req.user.id, queryDto);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string): Promise<SimulatorSetResponseDto> {
    return this.simulatorService.findOne(req.user.id, id);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateSimulatorSetDto,
  ): Promise<SimulatorSetResponseDto> {
    return this.simulatorService.update(req.user.id, id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req, @Param('id') id: string): Promise<void> {
    return this.simulatorService.remove(req.user.id, id);
  }
}
