import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, Between } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto, SortField, SortOrder } from './dto/query-product.dto';
import {
  ProductResponseDto,
  PaginatedProductResponseDto,
} from './dto/product-response.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const product = this.productRepository.create({
      ...createProductDto,
      stock: createProductDto.stock ?? 0,
      discountRate: createProductDto.discountRate ?? 0,
      rating: createProductDto.rating ?? 0,
      isActive: createProductDto.isActive ?? true,
    });

    const savedProduct = await this.productRepository.save(product);
    return new ProductResponseDto(savedProduct);
  }

  async findAll(
    queryDto: QueryProductDto,
  ): Promise<PaginatedProductResponseDto> {
    const {
      brandId,
      categoryId,
      tag,
      search,
      minPrice,
      maxPrice,
      minRating,
      sortBy = SortField.CREATED_AT,
      sortOrder = SortOrder.DESC,
      page = 1,
      take = 20,
    } = queryDto;

    const where: FindOptionsWhere<Product> = {
      isActive: true,
    };

    if (brandId) {
      where.brandId = brandId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tag) {
      where.tag = tag;
    }

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // 기본 where 조건
    queryBuilder.where('product.isActive = :isActive', { isActive: true });

    if (brandId) {
      queryBuilder.andWhere('product.brandId = :brandId', { brandId });
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', {
        categoryId,
      });
    }

    if (tag) {
      queryBuilder.andWhere('product.tag = :tag', { tag });
    }

    if (search) {
      queryBuilder.andWhere('product.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceMin = minPrice ?? 0;
      const priceMax = maxPrice ?? Number.MAX_SAFE_INTEGER;
      queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: priceMin,
        maxPrice: priceMax,
      });
    }

    if (minRating !== undefined) {
      queryBuilder.andWhere('product.rating >= :minRating', { minRating });
    }

    // 정렬
    const orderBy = `product.${sortBy}`;
    queryBuilder.orderBy(orderBy, sortOrder);

    // 페이지네이션
    const skip = (page - 1) * take;
    queryBuilder.skip(skip).take(take);

    const [products, total] = await queryBuilder.getManyAndCount();

    return new PaginatedProductResponseDto(products, total, page, take);
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`제품을 찾을 수 없습니다. (ID: ${id})`);
    }

    // 조회수 증가
    product.viewCount += 1;
    await this.productRepository.save(product);

    return new ProductResponseDto(product);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`제품을 찾을 수 없습니다. (ID: ${id})`);
    }

    Object.assign(product, updateProductDto);
    const updatedProduct = await this.productRepository.save(product);

    return new ProductResponseDto(updatedProduct);
  }

  async remove(id: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`제품을 찾을 수 없습니다. (ID: ${id})`);
    }

    // 실제 삭제 대신 isActive를 false로 변경 (soft delete)
    product.isActive = false;
    await this.productRepository.save(product);
  }

  async getTopProducts(
    limit: number = 5,
    sortBy: SortField = SortField.SALES_COUNT,
  ): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.find({
      where: { isActive: true },
      order: {
        [sortBy]: 'DESC',
      },
      take: limit,
    });

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
}

