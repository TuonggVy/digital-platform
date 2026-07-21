import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum SandboxResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  CANCEL = 'CANCEL',
}

export class SandboxCompleteDto {
  @ApiProperty({ enum: SandboxResult, example: SandboxResult.SUCCESS })
  @IsEnum(SandboxResult)
  result: SandboxResult;
}
