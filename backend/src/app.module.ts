import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { buildTypeOrmConfig } from './common/config/data.config';
import { LogModule } from './common/log_service/log.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HealthModule } from './features/health/health.module';
import { StatusesModule } from './features/statuses/statuses.module';
import { RolesModule } from './features/roles/roles.module';
import { UsersModule } from './features/users/users.module';
import { AuthModule } from './features/auth/auth.module';
import { CategoriesModule } from './features/categories/categories.module';
import { ProductsModule } from './features/products/products.module';
import { OrdersModule } from './features/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => buildTypeOrmConfig(config),
    }),
    LogModule,
    HealthModule,
    StatusesModule,
    RolesModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
