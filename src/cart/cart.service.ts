import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductOption } from '../products/entities/product-option.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItemResponseDto } from './dto/cart-item-response.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductOption)
    private readonly productOptionRepository: Repository<ProductOption>,
  ) {}

  async addItem(
    userId: string,
    createCartItemDto: CreateCartItemDto,
  ): Promise<CartItemResponseDto> {
    // 제품 확인
    const product = await this.productRepository.findOne({
      where: { id: createCartItemDto.productId, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('제품을 찾을 수 없습니다.');
    }

    // 옵션 확인 (옵션이 있는 경우)
    let option = null;
    if (createCartItemDto.optionId) {
      option = await this.productOptionRepository.findOne({
        where: {
          id: createCartItemDto.optionId,
          productId: createCartItemDto.productId,
          isActive: true,
        },
      });

      if (!option) {
        throw new NotFoundException('옵션을 찾을 수 없습니다.');
      }
    }

    // 기존 장바구니 아이템 확인
    const existingItem = await this.cartItemRepository.findOne({
      where: {
        userId,
        productId: createCartItemDto.productId,
        optionId: createCartItemDto.optionId || null,
      },
      relations: ['product', 'option'],
    });

    if (existingItem) {
      // 기존 아이템이 있으면 수량 증가
      existingItem.quantity += createCartItemDto.quantity;
      const updatedItem = await this.cartItemRepository.save(existingItem);
      return new CartItemResponseDto(updatedItem);
    }

    // 새 아이템 생성
    const cartItem = this.cartItemRepository.create({
      userId,
      productId: createCartItemDto.productId,
      optionId: createCartItemDto.optionId,
      quantity: createCartItemDto.quantity,
    });

    const savedItem = await this.cartItemRepository.save(cartItem);
    const itemWithRelations = await this.cartItemRepository.findOne({
      where: { id: savedItem.id },
      relations: ['product', 'option'],
    });

    return new CartItemResponseDto(itemWithRelations);
  }

  async findAll(userId: string): Promise<CartItemResponseDto[]> {
    const cartItems = await this.cartItemRepository.find({
      where: { userId },
      relations: ['product', 'option'],
      order: { createdAt: 'DESC' },
    });

    return cartItems.map((item) => new CartItemResponseDto(item));
  }

  async update(
    userId: string,
    itemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItemResponseDto> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, userId },
      relations: ['product', 'option'],
    });

    if (!cartItem) {
      throw new NotFoundException('장바구니 아이템을 찾을 수 없습니다.');
    }

    cartItem.quantity = updateCartItemDto.quantity;
    const updatedItem = await this.cartItemRepository.save(cartItem);

    return new CartItemResponseDto(updatedItem);
  }

  async remove(userId: string, itemId: string): Promise<void> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, userId },
    });

    if (!cartItem) {
      throw new NotFoundException('장바구니 아이템을 찾을 수 없습니다.');
    }

    await this.cartItemRepository.remove(cartItem);
  }

  async clear(userId: string): Promise<void> {
    await this.cartItemRepository.delete({ userId });
  }
}

