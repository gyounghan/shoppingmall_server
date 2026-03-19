import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ConsultingService } from './consulting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateConsultingRequestDto } from './dto/create-consulting-request.dto';
import { ConsultingRequestResponseDto } from './dto/consulting-request-response.dto';

@Controller('consulting')
@UseGuards(JwtAuthGuard)
export class ConsultingController {
  constructor(private readonly consultingService: ConsultingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req,
    @Body() createDto: CreateConsultingRequestDto,
  ): Promise<ConsultingRequestResponseDto> {
    return this.consultingService.create(req.user.id, createDto);
  }

  @Get('me')
  async findMine(@Request() req): Promise<ConsultingRequestResponseDto[]> {
    return this.consultingService.findMine(req.user.id);
  }
}
