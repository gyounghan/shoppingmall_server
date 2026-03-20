import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { QueryCategoryDto } from '../dto/query-category.dto';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  create(data: Partial<Category>): Category {
    return this.categoryRepo.create(data as Category);
  }

  save(category: Category): Promise<Category> {
    return this.categoryRepo.save(category);
  }

  findById(id: string): Promise<Category | null> {
    return this.categoryRepo.findOne({ where: { id } });
  }

  findByIdActive(id: string): Promise<Category | null> {
    return this.categoryRepo.findOne({ where: { id, isActive: true } });
  }

  findMainCategories(): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { parentId: IsNull(), isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findAll(queryDto: QueryCategoryDto): Promise<[Category[], number]> {
    const { search, isActive, page = 1, take = 20 } = queryDto;

    const qb = this.categoryRepo.createQueryBuilder('category');

    if (isActive !== undefined) {
      qb.andWhere('category.isActive = :isActive', { isActive });
    }
    if (search) {
      qb.andWhere('category.name LIKE :search', { search: `%${search}%` });
    }

    qb.orderBy('category.createdAt', 'DESC').skip((page - 1) * take).take(take);

    return qb.getManyAndCount();
  }

  async findChildCategoryIds(parentId: string): Promise<string[]> {
    const children = await this.categoryRepo.find({
      where: { parentId, isActive: true },
      select: ['id'],
    });
    return children.map((c) => c.id);
  }
}
