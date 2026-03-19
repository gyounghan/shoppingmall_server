import { Product, ProductTag } from '../entities/product.entity';
import { ProductImage } from '../entities/product-image.entity';
import { ProductOption } from '../entities/product-option.entity';
import { ProductCompatibility } from '../entities/product-compatibility.entity';
import { ProductRecommendation } from '../entities/product-recommendation.entity';

export class ProductResponseDto {
  id: string;
  name: string;
  description: string;
  htmlDescription?: string;
  price: number;
  image: string;
  tag: ProductTag;
  brandId: string;
  categoryId: string;
  stock: number;
  discountRate: number;
  rating: number;
  reviewCount: number;
  viewCount: number;
  salesCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(product: Product) {
    this.id = product.id;
    this.name = product.name;
    this.description = product.description;
    this.htmlDescription = product.htmlDescription;
    this.price = Number(product.price);
    this.image = product.image;
    this.tag = product.tag;
    this.brandId = product.brandId;
    this.categoryId = product.categoryId;
    this.stock = product.stock;
    this.discountRate = Number(product.discountRate);
    this.rating = Number(product.rating);
    this.reviewCount = product.reviewCount;
    this.viewCount = product.viewCount;
    this.salesCount = product.salesCount;
    this.isActive = product.isActive;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }
}

export class ProductDetailResponseDto extends ProductResponseDto {
  images: {
    id: string;
    url: string;
    alt?: string;
    order: number;
  }[];
  options: {
    id: string;
    name: string;
    price?: number;
    stock: number;
    order: number;
  }[];
  compatibilityProducts: {
    id: string;
    product: ProductResponseDto;
    order: number;
  }[];
  recommendationProducts: {
    id: string;
    product: ProductResponseDto;
    order: number;
  }[];

  constructor(
    product: Product,
    images: ProductImage[],
    options: ProductOption[],
    compatibilityProducts: ProductCompatibility[],
    recommendationProducts: ProductRecommendation[],
  ) {
    super(product);
    this.images = images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      order: img.order,
    }));
    this.options = options.map((opt) => ({
      id: opt.id,
      name: opt.name,
      price: opt.price ? Number(opt.price) : undefined,
      stock: opt.stock,
      order: opt.order,
    }));
    this.compatibilityProducts = compatibilityProducts.map((cp) => ({
      id: cp.id,
      product: new ProductResponseDto(cp.compatibleProduct),
      order: cp.order,
    }));
    this.recommendationProducts = recommendationProducts.map((rp) => ({
      id: rp.id,
      product: new ProductResponseDto(rp.recommendedProduct),
      order: rp.order,
    }));
  }
}

export class PaginatedProductResponseDto {
  data: ProductResponseDto[];
  total: number;
  page: number;
  take: number;
  totalPages: number;

  constructor(
    products: Product[],
    total: number,
    page: number,
    take: number,
  ) {
    this.data = products.map((product) => new ProductResponseDto(product));
    this.total = total;
    this.page = page;
    this.take = take;
    this.totalPages = Math.ceil(total / take);
  }
}

