import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { BrandResponseDto } from './dto/brand-response.dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBrandDto: CreateBrandDto): Promise<BrandResponseDto> {
    return this.brandsService.create(createBrandDto);
  }

  @Get()
  async findAll(@Query() queryDto: QueryBrandDto): Promise<BrandResponseDto[]> {
    return this.brandsService.findAll(queryDto);
  }

  @Get(':idOrSlug')
  async findOne(
    @Param('idOrSlug') idOrSlug: string,
  ): Promise<BrandResponseDto> {
    return this.brandsService.findOne(idOrSlug);
  }

  @Patch(':idOrSlug')
  async update(
    @Param('idOrSlug') idOrSlug: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ): Promise<BrandResponseDto> {
    return this.brandsService.update(idOrSlug, updateBrandDto);
  }

  @Delete(':idOrSlug')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('idOrSlug') idOrSlug: string): Promise<void> {
    return this.brandsService.remove(idOrSlug);
  }
}

