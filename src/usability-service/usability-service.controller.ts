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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsabilityServiceService } from './usability-service.service';
import { CreateUsabilityServiceRequestDto } from './dto/create-usability-service-request.dto';
import { UsabilityServiceRequestResponseDto } from './dto/usability-service-request-response.dto';

@Controller('usability-services')
@UseGuards(JwtAuthGuard)
export class UsabilityServiceController {
  constructor(private readonly usabilityServiceService: UsabilityServiceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req,
    @Body() createDto: CreateUsabilityServiceRequestDto,
  ): Promise<UsabilityServiceRequestResponseDto> {
    return this.usabilityServiceService.create(req.user.id, createDto);
  }

  @Get('me')
  async findMine(@Request() req): Promise<UsabilityServiceRequestResponseDto[]> {
    return this.usabilityServiceService.findMine(req.user.id);
  }
}
