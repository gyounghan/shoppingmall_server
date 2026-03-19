import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from './entities/wishlist-item.entity';
import { Product } from '../products/entities/product.entity';
import { WishlistItemResponseDto } from './dto/wishlist-item-response.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistItemRepository: Repository<WishlistItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async addItem(
    userId: string,
    productId: string,
  ): Promise<WishlistItemResponseDto> {
    // 제품 확인
    const product = await this.productRepository.findOne({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('제품을 찾을 수 없습니다.');
    }

    // 이미 찜한 제품인지 확인
    const existingItem = await this.wishlistItemRepository.findOne({
      where: { userId, productId },
    });

    if (existingItem) {
      throw new ConflictException('이미 찜한 제품입니다.');
    }

    // 찜 목록에 추가
    const wishlistItem = this.wishlistItemRepository.create({
      userId,
      productId,
    });

    const savedItem = await this.wishlistItemRepository.save(wishlistItem);
    const itemWithRelations = await this.wishlistItemRepository.findOne({
      where: { id: savedItem.id },
      relations: ['product'],
    });

    return new WishlistItemResponseDto(itemWithRelations);
  }

  async findAll(userId: string): Promise<WishlistItemResponseDto[]> {
    const wishlistItems = await this.wishlistItemRepository.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });

    return wishlistItems.map((item) => new WishlistItemResponseDto(item));
  }

  async remove(userId: string, itemId: string): Promise<void> {
    const wishlistItem = await this.wishlistItemRepository.findOne({
      where: { id: itemId, userId },
    });

    if (!wishlistItem) {
      throw new NotFoundException('찜 목록 아이템을 찾을 수 없습니다.');
    }

    await this.wishlistItemRepository.remove(wishlistItem);
  }

  async removeByProductId(userId: string, productId: string): Promise<void> {
    const wishlistItem = await this.wishlistItemRepository.findOne({
      where: { userId, productId },
    });

    if (wishlistItem) {
      await this.wishlistItemRepository.remove(wishlistItem);
    }
  }
}

