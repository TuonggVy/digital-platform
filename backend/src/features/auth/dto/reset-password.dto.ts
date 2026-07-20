import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Raw reset token nhận được trong reset URL', example: 'a1b2c3...' })
  @IsString()
  token: string;

  @ApiProperty({ example: '12345678', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
