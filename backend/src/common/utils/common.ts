import { HttpException } from '@nestjs/common';
import { ResponseCode, responseMessage } from './constant';

const STATUS_TO_CODE: Record<number, ResponseCode> = {
  400: ResponseCode.BAD_REQUEST,
  401: ResponseCode.UNAUTHORIZED,
  403: ResponseCode.UNAUTHORIZED,
  404: ResponseCode.NOT_FOUND,
  409: ResponseCode.CONFLICT,
};

export function handleError(
  error: any,
  defaultMessage: string = responseMessage.internalError,
): { code: ResponseCode; message: string } {
  if (error instanceof HttpException) {
    const status = error.getStatus();
    const response = error.getResponse();
    const message =
      typeof response === 'string'
        ? response
        : (response as any)?.message || defaultMessage;
    return {
      code: STATUS_TO_CODE[status] ?? ResponseCode.BAD_REQUEST,
      message: Array.isArray(message) ? message.join(', ') : message,
    };
  }
  return { code: ResponseCode.INTERNAL_ERROR, message: defaultMessage };
}

export function successResponse<T>(data: T, message: string = responseMessage.success) {
  return { code: ResponseCode.SUCCESS, message, data };
}
