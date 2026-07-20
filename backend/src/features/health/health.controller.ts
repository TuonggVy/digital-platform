import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @Get('health_check')
  async check() {
    const isDbUp = this.dataSource.isInitialized;
    return {
      service: 'digital-platform-backend',
      status: 'UP',
      database: isDbUp ? 'UP' : 'DOWN',
      timestamp: new Date().toISOString(),
    };
  }
}
