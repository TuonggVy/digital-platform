import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggerService } from './common/log_service/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = app.get(LoggerService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.useGlobalInterceptors(new ResponseInterceptor());

  const frontendUrl = config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
  const frontendProdUrl = config.get<string>('FRONTEND_PRODUCTION_URL');
  app.enableCors({
    origin: [frontendUrl, ...(frontendProdUrl ? [frontendProdUrl] : [])],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Digital Platform API')
    .setDescription('Backend API cho Digital Platform (Cloud / Kaspersky / eSIM)')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);
  logger.log(`Application started on port ${port}`, 'Bootstrap');
  logger.log(`Swagger docs available at /api/docs`, 'Bootstrap');
}

bootstrap();
