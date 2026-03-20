import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { Brand } from './entities/brand.entity';
import { ProductsModule } from '../products/products.module';
import { BrandsRepository } from './repositories/brands.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Brand]), ProductsModule],
  controllers: [BrandsController],
  providers: [BrandsService, BrandsRepository],
  exports: [BrandsService],
})
export class BrandsModule {}
