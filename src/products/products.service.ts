import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto, SortField } from './dto/query-product.dto';
import {
  ProductResponseDto,
  PaginatedProductResponseDto,
  ProductDetailResponseDto,
} from './dto/product-response.dto';
import { ProductsRepository } from './repositories/products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const product = this.productsRepository.create({
      ...createProductDto,
      stock: createProductDto.stock ?? 0,
      discountRate: createProductDto.discountRate ?? 0,
      rating: createProductDto.rating ?? 0,
      isActive: createProductDto.isActive ?? true,
    });

    const savedProduct = await this.productsRepository.save(product);
    return new ProductResponseDto(savedProduct);
  }

  async findAll(queryDto: QueryProductDto): Promise<PaginatedProductResponseDto> {
    const { page = 1, take = 20 } = queryDto;
    const [products, total] = await this.productsRepository.findAll(queryDto);
    return new PaginatedProductResponseDto(products, total, page, take);
  }

  async findOne(id: string): Promise<ProductDetailResponseDto> {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundException(`제품을 찾을 수 없습니다. (ID: ${id})`);
    }

    product.viewCount += 1;
    await this.productsRepository.save(product);

    const { images, options, compatibility, recommendations } =
      await this.productsRepository.findRelatedData(id);

    return new ProductDetailResponseDto(
      product,
      images,
      options,
      compatibility,
      recommendations,
    );
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundException(`제품을 찾을 수 없습니다. (ID: ${id})`);
    }

    Object.assign(product, updateProductDto);
    const updatedProduct = await this.productsRepository.save(product);

    return new ProductResponseDto(updatedProduct);
  }

  async remove(id: string): Promise<void> {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundException(`제품을 찾을 수 없습니다. (ID: ${id})`);
    }

    product.isActive = false;
    await this.productsRepository.save(product);
  }

  async getTopProducts(
    limit: number = 5,
    sortBy: SortField = SortField.SALES_COUNT,
  ): Promise<ProductResponseDto[]> {
    const products = await this.productsRepository.getTopProducts(limit, sortBy);
    return products.map((product) => new ProductResponseDto(product));
  }

  async getProductsByBrand(
    brandId: string,
    queryDto: QueryProductDto,
  ): Promise<PaginatedProductResponseDto> {
    return this.findAll({ ...queryDto, brandId });
  }

  async getProductsByCategory(
    categoryId: string,
    queryDto: QueryProductDto,
  ): Promise<PaginatedProductResponseDto> {
    return this.findAll({ ...queryDto, categoryId });
  }

  async getProductsByMainCategory(
    mainCategoryId: string,
    queryDto: QueryProductDto,
  ): Promise<PaginatedProductResponseDto> {
    const mainCategory = await this.productsRepository.findMainCategory(mainCategoryId);
    if (!mainCategory) {
      throw new NotFoundException(
        `메인 카테고리를 찾을 수 없습니다. (ID: ${mainCategoryId})`,
      );
    }

    const childCategoryIds = await this.productsRepository.findChildCategoryIds(mainCategoryId);
    const categoryIds = [mainCategoryId, ...childCategoryIds];

    const { page = 1, take = 20 } = queryDto;
    const [products, total] = await this.productsRepository.findAllByCategoryIds(
      categoryIds,
      queryDto,
    );

    return new PaginatedProductResponseDto(products, total, page, take);
  }
}
