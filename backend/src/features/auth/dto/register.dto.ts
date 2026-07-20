import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

const PHONE_REGEX = /^[0-9+\s-]{8,15}$/;

export class RegisterDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty({ example: 'abc@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0912345678' })
  @IsString()
  @Matches(PHONE_REGEX, { message: 'Số điện thoại không hợp lệ' })
  phone: string;

  @ApiProperty({ example: '12345678', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
