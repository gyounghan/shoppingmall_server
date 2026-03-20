import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/product-image.entity';
import { ProductOption } from '../entities/product-option.entity';
import { ProductCompatibility } from '../entities/product-compatibility.entity';
import { ProductRecommendation } from '../entities/product-recommendation.entity';
import { Category } from '../../categories/entities/category.entity';
import { QueryProductDto, SortField, SortOrder } from '../dto/query-product.dto';

export interface ProductRelatedData {
  images: ProductImage[];
  options: ProductOption[];
  compatibility: ProductCompatibility[];
  recommendations: ProductRecommendation[];
}

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
    @InjectRepository(ProductOption)
    private readonly optionRepo: Repository<ProductOption>,
    @InjectRepository(ProductCompatibility)
    private readonly compatRepo: Repository<ProductCompatibility>,
    @InjectRepository(ProductRecommendation)
    private readonly recoRepo: Repository<ProductRecommendation>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  create(data: Partial<Product>): Product {
    return this.productRepo.create(data as Product);
  }

  save(product: Product): Promise<Product> {
    return this.productRepo.save(product);
  }

  findById(id: string): Promise<Product | null> {
    return this.productRepo.findOne({ where: { id } });
  }

  async findAll(queryDto: QueryProductDto): Promise<[Product[], number]> {
    const {
      brandId,
      categoryId,
      tag,
      search,
      minPrice,
      maxPrice,
      minRating,
      isActive = true,
      sortBy = SortField.CREATED_AT,
      sortOrder = SortOrder.DESC,
      page = 1,
      take = 20,
    } = queryDto;

    const qb = this.productRepo.createQueryBuilder('product');
    qb.where('product.isActive = :isActive', { isActive });

    if (brandId) {
      qb.andWhere('product.brandId = :brandId', { brandId });
    }
    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }
    if (tag) {
      qb.andWhere('product.tag = :tag', { tag });
    }
    if (search) {
      qb.andWhere('product.name LIKE :search', { search: `%${search}%` });
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceMin = minPrice ?? 0;
      const priceMax = maxPrice ?? Number.MAX_SAFE_INTEGER;
      qb.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: priceMin,
        maxPrice: priceMax,
      });
    }
    if (minRating !== undefined) {
      qb.andWhere('product.rating >= :minRating', { minRating });
    }

    qb.orderBy(`product.${sortBy}`, sortOrder);
    qb.skip((page - 1) * take).take(take);

    return qb.getManyAndCount();
  }

  async findAllByCategoryIds(
    categoryIds: string[],
    queryDto: QueryProductDto,
  ): Promise<[Product[], number]> {
    const {
      brandId,
      tag,
      search,
      minPrice,
      maxPrice,
      minRating,
      isActive = true,
      sortBy = SortField.CREATED_AT,
      sortOrder = SortOrder.DESC,
      page = 1,
      take = 20,
    } = queryDto;

    const qb = this.productRepo.createQueryBuilder('product');
    qb.where('product.isActive = :isActive', { isActive })
      .andWhere('product.categoryId IN (:...categoryIds)', { categoryIds });

    if (brandId) {
      qb.andWhere('product.brandId = :brandId', { brandId });
    }
    if (tag) {
      qb.andWhere('product.tag = :tag', { tag });
    }
    if (search) {
      qb.andWhere('product.name LIKE :search', { search: `%${search}%` });
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceMin = minPrice ?? 0;
      const priceMax = maxPrice ?? Number.MAX_SAFE_INTEGER;
      qb.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: priceMin,
        maxPrice: priceMax,
      });
    }
    if (minRating !== undefined) {
      qb.andWhere('product.rating >= :minRating', { minRating });
    }

    qb.orderBy(`product.${sortBy}`, sortOrder);
    qb.skip((page - 1) * take).take(take);

    return qb.getManyAndCount();
  }

  async findRelatedData(productId: string): Promise<ProductRelatedData> {
    const [images, options, compatibility, recommendations] = await Promise.all([
      this.imageRepo.find({ where: { productId }, order: { order: 'ASC' } }),
      this.optionRepo.find({ where: { productId, isActive: true }, order: { order: 'ASC' } }),
      this.compatRepo.find({
        where: { productId, isActive: true },
        relations: ['compatibleProduct'],
        order: { order: 'ASC' },
      }),
      this.recoRepo.find({
        where: { productId, isActive: true },
        relations: ['recommendedProduct'],
        order: { order: 'ASC' },
      }),
    ]);

    return { images, options, compatibility, recommendations };
  }

  getTopProducts(limit: number, sortBy: SortField): Promise<Product[]> {
    return this.productRepo.find({
      where: { isActive: true },
      order: { [sortBy]: 'DESC' },
      take: limit,
    });
  }

  findMainCategory(mainCategoryId: string): Promise<Category | null> {
    return this.categoryRepo.findOne({
      where: { id: mainCategoryId, isActive: true },
    });
  }

  async findChildCategoryIds(parentId: string): Promise<string[]> {
    const children = await this.categoryRepo.find({
      where: { parentId, isActive: true },
      select: ['id'],
    });
    return children.map((c) => c.id);
  }
}
