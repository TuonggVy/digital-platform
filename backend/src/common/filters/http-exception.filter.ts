import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { handleError } from '../utils/common';
import { LoggerService } from '../log_service/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger?: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const httpStatus = exception instanceof HttpException ? exception.getStatus() : 500;
    const { code, message } = handleError(exception);

    if (!(exception instanceof HttpException)) {
      this.logger?.error(
        exception instanceof Error ? exception.message : 'Unknown error',
        exception instanceof Error ? exception.stack : undefined,
        'ExceptionFilter',
      );
    }

    response.status(httpStatus).json({ code, message, data: null });
  }
}
