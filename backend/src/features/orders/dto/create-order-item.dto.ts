import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'ID của Product', format: 'uuid' })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({
    description:
      'ID của package trong Product.packages. Bắt buộc nếu Product có định nghĩa package.',
  })
  @IsOptional()
  @IsString()
  packageId?: string;

  @ApiProperty({ description: 'Số lượng, phải > 0', minimum: 1, example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
