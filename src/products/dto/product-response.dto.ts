import { Product, ProductTag } from '../../entities/product.entity';

export class ProductResponseDto {
  id: string;
  name: string;
  description: string;
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

