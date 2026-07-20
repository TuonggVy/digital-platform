import { IsString } from 'class-validator';

export class LocalizedTextDto {
  @IsString()
  vi: string;

  @IsString()
  en: string;
}
