import { WishlistItem } from '../entities/wishlist-item.entity';
import { ProductResponseDto } from '../../products/dto/product-response.dto';

export class WishlistItemResponseDto {
  id: string;
  productId: string;
  product: ProductResponseDto;
  createdAt: Date;
  updatedAt: Date;

  constructor(wishlistItem: WishlistItem) {
    this.id = wishlistItem.id;
    this.productId = wishlistItem.productId;
    this.product = new ProductResponseDto(wishlistItem.product);
    this.createdAt = wishlistItem.createdAt;
    this.updatedAt = wishlistItem.updatedAt;
  }
}

