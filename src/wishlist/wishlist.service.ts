import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { WishlistItemResponseDto } from './dto/wishlist-item-response.dto';
import { WishlistRepository } from './repositories/wishlist.repository';

@Injectable()
export class WishlistService {
  constructor(private readonly wishlistRepository: WishlistRepository) {}

  async addItem(userId: string, productId: string): Promise<WishlistItemResponseDto> {
    const product = await this.wishlistRepository.findProduct(productId);

    if (!product) {
      throw new NotFoundException('제품을 찾을 수 없습니다.');
    }

    const existingItem = await this.wishlistRepository.findExisting(userId, productId);

    if (existingItem) {
      throw new ConflictException('이미 찜한 제품입니다.');
    }

    const wishlistItem = this.wishlistRepository.create({ userId, productId });
    const savedItem = await this.wishlistRepository.save(wishlistItem);

    const itemWithRelations = await this.wishlistRepository.findOneByIdWithRelations(savedItem.id);

    if (!itemWithRelations) {
      throw new NotFoundException('찜 목록 아이템을 찾을 수 없습니다.');
    }

    return new WishlistItemResponseDto(itemWithRelations);
  }

  async findAll(userId: string): Promise<WishlistItemResponseDto[]> {
    const wishlistItems = await this.wishlistRepository.findByUser(userId);
    return wishlistItems.map((item) => new WishlistItemResponseDto(item));
  }

  async remove(userId: string, itemId: string): Promise<void> {
    const wishlistItem = await this.wishlistRepository.findOneById(itemId, userId);

    if (!wishlistItem) {
      throw new NotFoundException('찜 목록 아이템을 찾을 수 없습니다.');
    }

    await this.wishlistRepository.remove(wishlistItem);
  }

  async removeByProductId(userId: string, productId: string): Promise<void> {
    const wishlistItem = await this.wishlistRepository.findExisting(userId, productId);

    if (wishlistItem) {
      await this.wishlistRepository.remove(wishlistItem);
    }
  }
}
