import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../entities/cart-item.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductOption } from '../../products/entities/product-option.entity';

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductOption)
    private readonly optionRepo: Repository<ProductOption>,
  ) {}

  findProduct(productId: string): Promise<Product | null> {
    return this.productRepo.findOne({ where: { id: productId, isActive: true } });
  }

  findOption(optionId: string, productId: string): Promise<ProductOption | null> {
    return this.optionRepo.findOne({
      where: { id: optionId, productId, isActive: true },
    });
  }

  findExisting(
    userId: string,
    productId: string,
    optionId: string | null,
  ): Promise<CartItem | null> {
    return this.cartItemRepo.findOne({
      where: { userId, productId, optionId: optionId ?? undefined },
      relations: ['product', 'option'],
    });
  }

  findByUser(userId: string): Promise<CartItem[]> {
    return this.cartItemRepo.find({
      where: { userId },
      relations: ['product', 'option'],
      order: { createdAt: 'DESC' },
    });
  }

  findOneById(id: string, userId: string): Promise<CartItem | null> {
    return this.cartItemRepo.findOne({
      where: { id, userId },
      relations: ['product', 'option'],
    });
  }

  findOneByIdForDelete(id: string, userId: string): Promise<CartItem | null> {
    return this.cartItemRepo.findOne({ where: { id, userId } });
  }

  findOneByIdWithRelations(id: string): Promise<CartItem | null> {
    return this.cartItemRepo.findOne({
      where: { id },
      relations: ['product', 'option'],
    });
  }

  create(data: Partial<CartItem>): CartItem {
    return this.cartItemRepo.create(data as CartItem);
  }

  save(item: CartItem): Promise<CartItem> {
    return this.cartItemRepo.save(item);
  }

  remove(item: CartItem): Promise<CartItem> {
    return this.cartItemRepo.remove(item);
  }

  deleteByUser(userId: string): Promise<void> {
    return this.cartItemRepo.delete({ userId }).then(() => undefined);
  }
}
