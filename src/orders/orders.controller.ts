import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto, CreateGuestOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req,
    @Body() createDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.create(req.user.id, createDto);
  }

  @Post('guest')
  @HttpCode(HttpStatus.CREATED)
  async createGuest(@Body() createDto: CreateGuestOrderDto): Promise<OrderResponseDto> {
    return this.ordersService.create(null, createDto);
  }

  @Get('guest/:orderId')
  async findGuestOrder(
    @Param('orderId') orderId: string,
    @Query('email') email: string,
  ): Promise<OrderResponseDto> {
    if (!email?.trim()) {
      throw new BadRequestException('email 쿼리 파라미터가 필요합니다.');
    }
    return this.ordersService.findByGuestOrderId(orderId, email.trim());
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMine(@Request() req): Promise<OrderResponseDto[]> {
    return this.ordersService.findMine(req.user.id);
  }
}
