import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetProductsDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subCategory?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  billingCycle?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @Type(() => Number)
  days?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hotspot?: boolean;

  @IsOptional()
  @IsString()
  userType?: string;

  @IsOptional()
  @Type(() => Number)
  devices?: number;

  @IsOptional()
  @IsIn(['featured', 'price_asc', 'price_desc'])
  sort?: 'featured' | 'price_asc' | 'price_desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 20;
}
