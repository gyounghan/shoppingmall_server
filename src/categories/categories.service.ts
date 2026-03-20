import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CategoryListResponseDto } from './dto/category-list-response.dto';
import { CategoriesRepository } from './repositories/categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      isActive: createCategoryDto.isActive ?? true,
    });
    const savedCategory = await this.categoriesRepository.save(category);
    return new CategoryResponseDto(savedCategory);
  }

  async findMainCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoriesRepository.findMainCategories();
    return categories.map((c) => new CategoryResponseDto(c));
  }

  async findAll(queryDto: QueryCategoryDto): Promise<CategoryListResponseDto> {
    const { page = 1, take = 20 } = queryDto;
    const [categories, total] = await this.categoriesRepository.findAll(queryDto);
    return new CategoryListResponseDto(categories, total, page, take);
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoriesRepository.findByIdActive(id);

    if (!category) {
      throw new NotFoundException(`카테고리를 찾을 수 없습니다. (ID: ${id})`);
    }

    return new CategoryResponseDto(category);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`카테고리를 찾을 수 없습니다. (ID: ${id})`);
    }
    Object.assign(category, updateCategoryDto);
    const updatedCategory = await this.categoriesRepository.save(category);
    return new CategoryResponseDto(updatedCategory);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`카테고리를 찾을 수 없습니다. (ID: ${id})`);
    }
    category.isActive = false;
    await this.categoriesRepository.save(category);
  }
}
