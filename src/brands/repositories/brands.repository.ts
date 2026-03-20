import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { QueryBrandDto } from '../dto/query-brand.dto';

@Injectable()
export class BrandsRepository {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
  ) {}

  create(data: Partial<Brand>): Brand {
    return this.brandRepo.create(data as Brand);
  }

  save(brand: Brand): Promise<Brand> {
    return this.brandRepo.save(brand);
  }

  findBySlug(slug: string): Promise<Brand | null> {
    return this.brandRepo.findOne({ where: { slug } });
  }

  findByIdOrSlug(idOrSlug: string): Promise<Brand | null> {
    return this.brandRepo.findOne({
      where: [{ id: idOrSlug }, { slug: idOrSlug }],
    });
  }

  findAll(queryDto: QueryBrandDto): Promise<Brand[]> {
    const { search, isActive } = queryDto;
    const where: Record<string, unknown> = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (search) {
      where.name = Like(`%${search}%`);
    }

    return this.brandRepo.find({ where, order: { name: 'ASC' } });
  }
}
