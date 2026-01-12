import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, Like } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { BrandResponseDto } from './dto/brand-response.dto';
import { ProductsService } from '../products/products.service';
import { envVariableKeys } from '../common/env-variable-keys';

@Injectable()
export class BrandsService {
    private readonly baseUrl: string;

    constructor(
        @InjectRepository(Brand)
        private readonly brandRepository: Repository<Brand>,
        private readonly productsService: ProductsService,
        private readonly configService: ConfigService,
    ) {
        const port = this.configService.get<number>(envVariableKeys.port) || 3000;
        this.baseUrl = `http://localhost:${port}`;
    }

    async create(createBrandDto: CreateBrandDto): Promise<BrandResponseDto> {
        // slug 중복 확인
        const existingBrand = await this.brandRepository.findOne({
            where: { slug: createBrandDto.slug },
        });

        if (existingBrand) {
            throw new ConflictException(
                `이미 존재하는 브랜드 slug입니다: ${createBrandDto.slug}`,
            );
        }

        const brand = this.brandRepository.create({
            ...createBrandDto,
            hasLogo: createBrandDto.hasLogo ?? false,
            hasOverlay: createBrandDto.hasOverlay ?? false,
            isActive: true,
            productCount: 0, // 초기값, 나중에 제품 모듈에서 업데이트
        });

        const savedBrand = await this.brandRepository.save(brand);
        return new BrandResponseDto(savedBrand, this.baseUrl);
    }

    async findAll(queryDto: QueryBrandDto): Promise<BrandResponseDto[]> {
        const { search, isActive } = queryDto;

        const where: any = {};

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        if (search) {
            where.name = Like(`%${search}%`);
        }

        const brands = await this.brandRepository.find({
            where,
            order: { name: 'ASC' },
        });

        // 각 브랜드의 실제 제품 수 계산
        const brandsWithCount = await Promise.all(
            brands.map(async (brand) => {
                const products = await this.productsService.findAll({
                    brandId: brand.slug,
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
        const brand = await this.brandRepository.findOne({
            where: [{ id: idOrSlug }, { slug: idOrSlug }],
        });

        if (!brand) {
            throw new NotFoundException(
                `브랜드를 찾을 수 없습니다. (ID/Slug: ${idOrSlug})`,
            );
        }

        // 실제 제품 수 계산
        const products = await this.productsService.findAll({
            brandId: brand.slug,
            page: 1,
            take: 1,
        });
        brand.productCount = products.total;

        return new BrandResponseDto(brand, this.baseUrl);
    }

    async update(
        idOrSlug: string,
        updateBrandDto: UpdateBrandDto,
    ): Promise<BrandResponseDto> {
        const brand = await this.brandRepository.findOne({
            where: [{ id: idOrSlug }, { slug: idOrSlug }],
        });

        if (!brand) {
            throw new NotFoundException(
                `브랜드를 찾을 수 없습니다. (ID/Slug: ${idOrSlug})`,
            );
        }

        // slug 변경 시 중복 확인
        if ('slug' in updateBrandDto && updateBrandDto.slug && updateBrandDto.slug !== brand.slug) {
            const existingBrand = await this.brandRepository.findOne({
                where: { slug: updateBrandDto.slug },
            });

            if (existingBrand) {
                throw new ConflictException(
                    `이미 존재하는 브랜드 slug입니다: ${updateBrandDto.slug}`,
                );
            }
        }

        Object.assign(brand, updateBrandDto);
        const updatedBrand = await this.brandRepository.save(brand);

        return new BrandResponseDto(updatedBrand, this.baseUrl);
    }

    async remove(idOrSlug: string): Promise<void> {
        const brand = await this.brandRepository.findOne({
            where: [{ id: idOrSlug }, { slug: idOrSlug }],
        });

        if (!brand) {
            throw new NotFoundException(
                `브랜드를 찾을 수 없습니다. (ID/Slug: ${idOrSlug})`,
            );
        }

        // 실제 삭제 대신 isActive를 false로 변경 (soft delete)
        brand.isActive = false;
        await this.brandRepository.save(brand);
    }
}

