import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductOption } from '../products/entities/product-option.entity';
import { CartRepository } from './repositories/cart.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, Product, ProductOption])],
  controllers: [CartController],
  providers: [CartService, CartRepository],
})
export class CartModule {}
