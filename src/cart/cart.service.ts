import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItemResponseDto } from './dto/cart-item-response.dto';
import { CartRepository } from './repositories/cart.repository';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async addItem(
    userId: string,
    createCartItemDto: CreateCartItemDto,
  ): Promise<CartItemResponseDto> {
    const product = await this.cartRepository.findProduct(createCartItemDto.productId);

    if (!product) {
      throw new NotFoundException('제품을 찾을 수 없습니다.');
    }

    if (createCartItemDto.optionId) {
      const option = await this.cartRepository.findOption(
        createCartItemDto.optionId,
        createCartItemDto.productId,
      );

      if (!option) {
        throw new NotFoundException('옵션을 찾을 수 없습니다.');
      }
    }

    const existingItem = await this.cartRepository.findExisting(
      userId,
      createCartItemDto.productId,
      createCartItemDto.optionId ?? null,
    );

    if (existingItem) {
      existingItem.quantity += createCartItemDto.quantity;
      const updatedItem = await this.cartRepository.save(existingItem);
      return new CartItemResponseDto(updatedItem);
    }

    const cartItem = this.cartRepository.create({
      userId,
      productId: createCartItemDto.productId,
      optionId: createCartItemDto.optionId ?? null,
      quantity: createCartItemDto.quantity,
    });

    const savedItem = await this.cartRepository.save(cartItem);
    const itemWithRelations = await this.cartRepository.findOneByIdWithRelations(savedItem.id);

    if (!itemWithRelations) {
      throw new NotFoundException('장바구니 아이템을 찾을 수 없습니다.');
    }

    return new CartItemResponseDto(itemWithRelations);
  }

  async findAll(userId: string): Promise<CartItemResponseDto[]> {
    const cartItems = await this.cartRepository.findByUser(userId);
    return cartItems.map((item) => new CartItemResponseDto(item));
  }

  async update(
    userId: string,
    itemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItemResponseDto> {
    const cartItem = await this.cartRepository.findOneById(itemId, userId);

    if (!cartItem) {
      throw new NotFoundException('장바구니 아이템을 찾을 수 없습니다.');
    }

    cartItem.quantity = updateCartItemDto.quantity;
    const updatedItem = await this.cartRepository.save(cartItem);

    return new CartItemResponseDto(updatedItem);
  }

  async remove(userId: string, itemId: string): Promise<void> {
    const cartItem = await this.cartRepository.findOneByIdForDelete(itemId, userId);

    if (!cartItem) {
      throw new NotFoundException('장바구니 아이템을 찾을 수 없습니다.');
    }

    await this.cartRepository.remove(cartItem);
  }

  async clear(userId: string): Promise<void> {
    await this.cartRepository.deleteByUser(userId);
  }
}
