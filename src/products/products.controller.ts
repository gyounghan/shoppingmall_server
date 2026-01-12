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
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto, SortField } from './dto/query-product.dto';
import {
  ProductResponseDto,
  PaginatedProductResponseDto,
} from './dto/product-response.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
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

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}

