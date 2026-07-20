import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../categories/category.entity';
import { GetProductsDto } from './dto/get-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { STATUS_CODE } from '../../common/utils/constant';
import { LoggerService } from '../../common/log_service/logger.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    private readonly logger: LoggerService,
  ) {}

  private async resolveCategoryId(code: string): Promise<string> {
    const category = await this.categoryRepo.findOne({ where: { code, deletedDate: IsNull() } });
    if (!category) {
      throw new BadRequestException(`Danh mục không tồn tại: ${code}`);
    }
    return category.id;
  }

  private matchesNestedFilters(product: Product, filters: GetProductsDto): boolean {
    if (!filters.region && !filters.days && filters.hotspot === undefined && !filters.userType && !filters.devices) {
      return true;
    }
    return product.packages.some((pkg) => {
      if (filters.region) {
        const cloudMatch = pkg.cloud?.regions?.includes(filters.region);
        const esimMatch = pkg.esim?.region === filters.region;
        if (!cloudMatch && !esimMatch) return false;
      }
      if (filters.days !== undefined && pkg.esim?.days !== filters.days) return false;
      if (filters.hotspot !== undefined && pkg.esim?.hotspot !== filters.hotspot) return false;
      if (filters.userType && pkg.kaspersky?.userType !== filters.userType) return false;
      if (filters.devices !== undefined && pkg.kaspersky?.devices !== filters.devices) return false;
      return true;
    });
  }

  async getProducts(filters: GetProductsDto) {
    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.deletedDate IS NULL')
      .andWhere('product.statusId = :active', { active: STATUS_CODE.ACTIVE });

    if (filters.category) {
      qb.andWhere('category.code = :category', { category: filters.category });
    }
    if (filters.subCategory) {
      qb.andWhere('product.subCategory = :subCategory', { subCategory: filters.subCategory });
    }
    if (filters.search) {
      qb.andWhere('LOWER(product.name) LIKE :search', { search: `%${filters.search.toLowerCase()}%` });
    }
    if (filters.minPrice !== undefined) {
      qb.andWhere('product.startingPrice >= :minPrice', { minPrice: filters.minPrice });
    }
    if (filters.maxPrice !== undefined) {
      qb.andWhere('product.startingPrice <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    let items = await qb.getMany();

    if (filters.billingCycle) {
      items = items.filter((p) => p.billingCycles.includes(filters.billingCycle as any));
    }
    items = items.filter((p) => this.matchesNestedFilters(p, filters));

    switch (filters.sort) {
      case 'price_asc':
        items.sort((a, b) => a.startingPrice - b.startingPrice);
        break;
      case 'price_desc':
        items.sort((a, b) => b.startingPrice - a.startingPrice);
        break;
      default:
        items.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const total = items.length;
    const paged = items.slice((page - 1) * pageSize, page * pageSize);

    return {
      items: paged,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async getFeaturedProducts(limit = 6) {
    return this.productRepo.find({
      where: { deletedDate: IsNull(), statusId: STATUS_CODE.ACTIVE, isFeatured: true },
      relations: ['category'],
      take: limit,
    });
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { slug, deletedDate: IsNull(), statusId: STATUS_CODE.ACTIVE },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    return product;
  }

  async getRelatedProducts(slug: string) {
    const product = await this.getProductBySlug(slug);
    if (!product.relatedProductIds?.length) return [];
    return this.productRepo.find({
      where: product.relatedProductIds.map((id) => ({ id, deletedDate: IsNull() as any })),
    });
  }

  async getAllForAdmin(): Promise<Product[]> {
    return this.productRepo.find({ where: { deletedDate: IsNull() }, relations: ['category'] });
  }

  async getByIdForAdmin(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id, deletedDate: IsNull() },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    return product;
  }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const existing = await this.productRepo.findOne({ where: { slug: dto.slug, deletedDate: IsNull() } });
    if (existing) {
      throw new BadRequestException('Slug sản phẩm đã tồn tại');
    }
    const { category, ...rest } = dto;
    const categoryId = await this.resolveCategoryId(category);
    const product = this.productRepo.create({
      ...rest,
      categoryId,
      currency: dto.currency ?? 'VND',
      statusId: STATUS_CODE.ACTIVE,
      packages: dto.packages ?? [],
      relatedProductIds: dto.relatedProductIds ?? [],
    } as Partial<Product>);
    const saved = await this.productRepo.save(product);
    this.logger.log(`Product created: ${saved.id} (${saved.slug})`, 'ProductsService');
    return saved;
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id, deletedDate: IsNull() } });
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    const { category, ...rest } = dto;
    const categoryId = category ? await this.resolveCategoryId(category) : undefined;
    Object.assign(product, rest, { modifiedDate: new Date() }, categoryId ? { categoryId } : {});
    const saved = await this.productRepo.save(product);
    this.logger.log(`Product updated: ${saved.id}`, 'ProductsService');
    return saved;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id, deletedDate: IsNull() } });
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    product.deletedDate = new Date();
    product.statusId = STATUS_CODE.DELETED;
    await this.productRepo.save(product);
    this.logger.log(`Product soft-deleted: ${id}`, 'ProductsService');
  }
}
