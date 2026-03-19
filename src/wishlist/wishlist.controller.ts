import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Body,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistItemResponseDto } from './dto/wishlist-item-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addItem(
    @Request() req,
    @Body('productId', ParseUUIDPipe) productId: string,
  ): Promise<WishlistItemResponseDto> {
    return this.wishlistService.addItem(req.user.id, productId);
  }

  @Get()
  async findAll(@Request() req): Promise<WishlistItemResponseDto[]> {
    return this.wishlistService.findAll(req.user.id);
  }

  @Delete(':itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Request() req,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<void> {
    return this.wishlistService.remove(req.user.id, itemId);
  }

  @Delete('product/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeByProductId(
    @Request() req,
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<void> {
    return this.wishlistService.removeByProductId(req.user.id, productId);
  }
}

