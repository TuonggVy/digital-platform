import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Order ID cần thanh toán' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.SANDBOX })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
