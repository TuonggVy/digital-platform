import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { LocalizedTextDto } from './localized-text.dto';
import { BillingCycle, ProductFaq, ProductPackage } from '../product.entity';

export class CreateProductDto {
  /** Category code (e.g. 'cloud' | 'kaspersky' | 'esim'), not the category's UUID —
   * this matches the FE's flat `Product.category` string 1:1, so the admin form
   * never needs to know/fetch category UUIDs. */
  @IsString()
  category: string;

  @IsString()
  subCategory: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @ValidateNested()
  @Type(() => LocalizedTextDto)
  name: LocalizedTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  shortDescription?: LocalizedTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  description?: LocalizedTextDto;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  badge?: LocalizedTextDto;

  @IsNumber()
  @Min(0)
  startingPrice: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsArray()
  @IsIn(['monthly', 'yearly', 'one_time'], { each: true })
  billingCycles: BillingCycle[];

  @IsOptional()
  @IsArray()
  features?: ProductFaq['question'][];

  @IsOptional()
  @IsArray()
  benefits?: LocalizedTextDto[];

  @IsOptional()
  @IsArray()
  howItWorks?: LocalizedTextDto[];

  @IsOptional()
  @IsArray()
  suitableFor?: LocalizedTextDto[];

  @IsOptional()
  @IsArray()
  faqs?: ProductFaq[];

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsArray()
  packages?: ProductPackage[];

  @IsOptional()
  @IsArray()
  relatedProductIds?: string[];
}
