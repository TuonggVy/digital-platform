import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class GetAdminOrdersDto {
  @ApiPropertyOptional({ description: 'Tìm theo orderCode, customerName, customerEmail, customerPhone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: ['newest', 'oldest', 'total_asc', 'total_desc'] })
  @IsOptional()
  @IsIn(['newest', 'oldest', 'total_asc', 'total_desc'])
  sort?: 'newest' | 'oldest' | 'total_asc' | 'total_desc';

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 20;
}
