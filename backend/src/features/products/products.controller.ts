import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { GetProductsDto } from './dto/get-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLE_CODE } from '../../common/utils/constant';

@ApiTags('Products')
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get('products')
  publicList(@Query() query: GetProductsDto) {
    return this.productsService.getProducts(query);
  }

  @Public()
  @Get('products/featured')
  publicFeatured(@Query('limit') limit?: number) {
    return this.productsService.getFeaturedProducts(limit ? Number(limit) : undefined);
  }

  @Public()
  @Get('products/:idOrSlug')
  publicDetail(@Param('idOrSlug') idOrSlug: string) {
    return this.productsService.getProductBySlug(idOrSlug);
  }

  @Public()
  @Get('products/:idOrSlug/related')
  publicRelated(@Param('idOrSlug') idOrSlug: string) {
    return this.productsService.getRelatedProducts(idOrSlug);
  }

  @ApiBearerAuth()
  @Roles(ROLE_CODE.ADMIN)
  @Get('admin/products')
  adminList() {
    return this.productsService.getAllForAdmin();
  }

  @ApiBearerAuth()
  @Roles(ROLE_CODE.ADMIN)
  @Get('admin/products/:id')
  adminDetail(@Param('id') id: string) {
    return this.productsService.getByIdForAdmin(id);
  }

  @ApiBearerAuth()
  @Roles(ROLE_CODE.ADMIN)
  @Post('admin/products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @ApiBearerAuth()
  @Roles(ROLE_CODE.ADMIN)
  @Patch('admin/products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.updateProduct(id, dto);
  }

  @ApiBearerAuth()
  @Roles(ROLE_CODE.ADMIN)
  @Delete('admin/products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }
}
