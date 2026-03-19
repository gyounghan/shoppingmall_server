import { CartItem } from '../entities/cart-item.entity';
import { ProductResponseDto } from '../../products/dto/product-response.dto';

export class CartItemResponseDto {
  id: string;
  productId: string;
  product: ProductResponseDto;
  optionId?: string;
  option?: {
    id: string;
    name: string;
    price?: number;
  };
  quantity: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(cartItem: CartItem) {
    this.id = cartItem.id;
    this.productId = cartItem.productId;
    this.product = new ProductResponseDto(cartItem.product);
    this.optionId = cartItem.optionId;
    if (cartItem.option) {
      this.option = {
        id: cartItem.option.id,
        name: cartItem.option.name,
        price: cartItem.option.price ? Number(cartItem.option.price) : undefined,
      };
    }
    this.quantity = cartItem.quantity;
    this.createdAt = cartItem.createdAt;
    this.updatedAt = cartItem.updatedAt;
  }
}

