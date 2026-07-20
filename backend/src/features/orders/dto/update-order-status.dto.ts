import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    description: 'Trạng thái mới. Phải là một transition hợp lệ từ trạng thái hiện tại của Order.',
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
