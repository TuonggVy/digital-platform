import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function buildTypeOrmConfig(config: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'mssql',
    host: config.get<string>('DB_HOST'),
    port: Number(config.get<string>('DB_PORT')),
    username: config.get<string>('DB_USERNAME'),
    password: config.get<string>('DB_PASSWORD'),
    database: config.get<string>('DB_NAME'),
    synchronize: false,
    autoLoadEntities: true,
    options: {
      encrypt: config.get<string>('DB_ENCRYPT') === 'true',
      trustServerCertificate: config.get<string>('DB_TRUST_SERVER_CERTIFICATE') === 'true',
    },
    extra: {
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    },
  };
}
