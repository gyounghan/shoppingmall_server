import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CategoryListResponseDto } from './dto/category-list-response.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      isActive: createCategoryDto.isActive ?? true,
    });
    const savedCategory = await this.categoryRepository.save(category);
    return new CategoryResponseDto(savedCategory);
  }

  /**
   * 메인 카테고리만 조회 (parentId가 null인 카테고리)
   */
  async findMainCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find({
      where: { parentId: null, isActive: true },
      order: { name: 'ASC' },
    });
    return categories.map((c) => new CategoryResponseDto(c));
  }

  async findAll(queryDto: QueryCategoryDto): Promise<CategoryListResponseDto> {
    const { search, isActive, page = 1, take = 20 } = queryDto;
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    if (isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', { isActive });
    }

    if (search) {
      queryBuilder.andWhere('category.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder
      .orderBy('category.createdAt', 'DESC')
      .skip((page - 1) * take)
      .take(take);

    const [categories, total] = await queryBuilder.getManyAndCount();
    return new CategoryListResponseDto(categories, total, page, take);
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { id, isActive: true },
    });

    if (!category) {
      throw new NotFoundException(`카테고리를 찾을 수 없습니다. (ID: ${id})`);
    }

    return new CategoryResponseDto(category);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`카테고리를 찾을 수 없습니다. (ID: ${id})`);
    }
    Object.assign(category, updateCategoryDto);
    const updatedCategory = await this.categoryRepository.save(category);
    return new CategoryResponseDto(updatedCategory);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`카테고리를 찾을 수 없습니다. (ID: ${id})`);
    }
    category.isActive = false;
    await this.categoryRepository.save(category);
  }
}

