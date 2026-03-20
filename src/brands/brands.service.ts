import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { BrandResponseDto } from './dto/brand-response.dto';
import { ProductsService } from '../products/products.service';
import { envVariableKeys } from '../common/env-variable-keys';
import { BrandsRepository } from './repositories/brands.repository';

@Injectable()
export class BrandsService {
  private readonly baseUrl: string;

  constructor(
    private readonly brandsRepository: BrandsRepository,
    private readonly productsService: ProductsService,
    private readonly configService: ConfigService,
  ) {
    const port = this.configService.get<number>(envVariableKeys.port) || 3000;
    this.baseUrl = `http://localhost:${port}`;
  }

  async create(createBrandDto: CreateBrandDto): Promise<BrandResponseDto> {
    const existingBrand = await this.brandsRepository.findBySlug(createBrandDto.slug);

    if (existingBrand) {
      throw new ConflictException(
        `이미 존재하는 브랜드 slug입니다: ${createBrandDto.slug}`,
      );
    }

    const brand = this.brandsRepository.create({
      ...createBrandDto,
      hasLogo: createBrandDto.hasLogo ?? false,
      hasOverlay: createBrandDto.hasOverlay ?? false,
      isActive: true,
      productCount: 0,
    });

    const savedBrand = await this.brandsRepository.save(brand);
    return new BrandResponseDto(savedBrand, this.baseUrl);
  }

  async findAll(queryDto: QueryBrandDto): Promise<BrandResponseDto[]> {
    const brands = await this.brandsRepository.findAll(queryDto);

    const brandsWithCount = await Promise.all(
      brands.map(async (brand) => {
        const products = await this.productsService.findAll({
          brandId: brand.id,
          page: 1,
          take: 1,
        });
        brand.productCount = products.total;
        return brand;
      }),
    );

    return brandsWithCount.map((brand) => new BrandResponseDto(brand, this.baseUrl));
  }

  async findOne(idOrSlug: string): Promise<BrandResponseDto> {
    const brand = await this.brandsRepository.findByIdOrSlug(idOrSlug);

    if (!brand) {
      throw new NotFoundException(
        `브랜드를 찾을 수 없습니다. (ID/Slug: ${idOrSlug})`,
      );
    }

    const products = await this.productsService.findAll({
      brandId: brand.id,
      page: 1,
      take: 1,
    });
    brand.productCount = products.total;

    return new BrandResponseDto(brand, this.baseUrl);
  }

  async update(idOrSlug: string, updateBrandDto: UpdateBrandDto): Promise<BrandResponseDto> {
    const brand = await this.brandsRepository.findByIdOrSlug(idOrSlug);

    if (!brand) {
      throw new NotFoundException(
        `브랜드를 찾을 수 없습니다. (ID/Slug: ${idOrSlug})`,
      );
    }

    if ('slug' in updateBrandDto && updateBrandDto.slug && updateBrandDto.slug !== brand.slug) {
      const existingBrand = await this.brandsRepository.findBySlug(updateBrandDto.slug);

      if (existingBrand) {
        throw new ConflictException(
          `이미 존재하는 브랜드 slug입니다: ${updateBrandDto.slug}`,
        );
      }
    }

    Object.assign(brand, updateBrandDto);
    const updatedBrand = await this.brandsRepository.save(brand);

    return new BrandResponseDto(updatedBrand, this.baseUrl);
  }

  async remove(idOrSlug: string): Promise<void> {
    const brand = await this.brandsRepository.findByIdOrSlug(idOrSlug);

    if (!brand) {
      throw new NotFoundException(
        `브랜드를 찾을 수 없습니다. (ID/Slug: ${idOrSlug})`,
      );
    }

    brand.isActive = false;
    await this.brandsRepository.save(brand);
  }
}
