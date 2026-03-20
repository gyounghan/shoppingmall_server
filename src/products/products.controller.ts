import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto, SortField } from './dto/query-product.dto';
import {
  ProductResponseDto,
  PaginatedProductResponseDto,
  ProductDetailResponseDto,
} from './dto/product-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  async findAll(
    @Query() queryDto: QueryProductDto,
  ): Promise<PaginatedProductResponseDto> {
    return this.productsService.findAll(queryDto);
  }

  @Get('top')
  async getTopProducts(
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: SortField,
  ): Promise<ProductResponseDto[]> {
    const limitNum = limit ? parseInt(limit.toString(), 10) : 5;
    return this.productsService.getTopProducts(limitNum, sortBy);
  }

  @Get('brand/:brandId')
  async getProductsByBrand(
    @Param('brandId') brandId: string,
    @Query() queryDto: QueryProductDto,
  ): Promise<PaginatedProductResponseDto> {
    return this.productsService.getProductsByBrand(brandId, queryDto);
  }

  @Get('category/:categoryId')
  async getProductsByCategory(
    @Param('categoryId') categoryId: string,
    @Query() queryDto: QueryProductDto,
  ): Promise<PaginatedProductResponseDto> {
    return this.productsService.getProductsByCategory(categoryId, queryDto);
  }

  @Get('main-category/:mainCategoryId')
  async getProductsByMainCategory(
    @Param('mainCategoryId', ParseUUIDPipe) mainCategoryId: string,
    @Query() queryDto: QueryProductDto,
  ): Promise<PaginatedProductResponseDto> {
    return this.productsService.getProductsByMainCategory(
      mainCategoryId,
      queryDto,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductDetailResponseDto> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}

