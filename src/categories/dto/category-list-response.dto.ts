import { Category } from '../entities/category.entity';
import { CategoryResponseDto } from './category-response.dto';

export class CategoryListResponseDto {
  data: CategoryResponseDto[];
  total: number;
  page: number;
  take: number;
  totalPages: number;

  constructor(categories: Category[], total: number, page: number, take: number) {
    this.data = categories.map((category) => new CategoryResponseDto(category));
    this.total = total;
    this.page = page;
    this.take = take;
    this.totalPages = Math.ceil(total / take);
  }
}
