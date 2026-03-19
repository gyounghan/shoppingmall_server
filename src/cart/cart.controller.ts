import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItemResponseDto } from './dto/cart-item-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addItem(
    @Request() req,
    @Body() createCartItemDto: CreateCartItemDto,
  ): Promise<CartItemResponseDto> {
    return this.cartService.addItem(req.user.id, createCartItemDto);
  }

  @Get()
  async findAll(@Request() req): Promise<CartItemResponseDto[]> {
    return this.cartService.findAll(req.user.id);
  }

  @Patch(':itemId')
  async update(
    @Request() req,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItemResponseDto> {
    return this.cartService.update(req.user.id, itemId, updateCartItemDto);
  }

  @Delete(':itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Request() req,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<void> {
    return this.cartService.remove(req.user.id, itemId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clear(@Request() req): Promise<void> {
    return this.cartService.clear(req.user.id);
  }
}

