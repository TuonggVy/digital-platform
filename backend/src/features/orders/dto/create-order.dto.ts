import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiProperty({ type: [CreateOrderItemDto], description: 'Danh sách sản phẩm muốn đặt' })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  customerName: string;

  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ example: '0901234567' })
  @IsString()
  customerPhone: string;

  @ApiPropertyOptional({ description: 'Ghi chú của khách hàng cho đơn hàng' })
  @IsOptional()
  @IsString()
  note?: string;
}
