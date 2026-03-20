import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from '../entities/wishlist-item.entity';
import { Product } from '../../products/entities/product.entity';

@Injectable()
export class WishlistRepository {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistItemRepo: Repository<WishlistItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  findProduct(productId: string): Promise<Product | null> {
    return this.productRepo.findOne({ where: { id: productId, isActive: true } });
  }

  findExisting(userId: string, productId: string): Promise<WishlistItem | null> {
    return this.wishlistItemRepo.findOne({ where: { userId, productId } });
  }

  findByUser(userId: string): Promise<WishlistItem[]> {
    return this.wishlistItemRepo.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  findOneById(id: string, userId: string): Promise<WishlistItem | null> {
    return this.wishlistItemRepo.findOne({ where: { id, userId } });
  }

  findOneByIdWithRelations(id: string): Promise<WishlistItem | null> {
    return this.wishlistItemRepo.findOne({
      where: { id },
      relations: ['product'],
    });
  }

  create(data: Partial<WishlistItem>): WishlistItem {
    return this.wishlistItemRepo.create(data as WishlistItem);
  }

  save(item: WishlistItem): Promise<WishlistItem> {
    return this.wishlistItemRepo.save(item);
  }

  remove(item: WishlistItem): Promise<WishlistItem> {
    return this.wishlistItemRepo.remove(item);
  }
}
