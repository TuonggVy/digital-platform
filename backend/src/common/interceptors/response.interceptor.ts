import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseCode, responseMessage } from '../utils/constant';

function isAlreadyWrapped(value: any): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    'code' in value &&
    'message' in value &&
    'data' in value
  );
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((result) => {
        if (isAlreadyWrapped(result)) {
          return result;
        }
        return {
          code: ResponseCode.SUCCESS,
          message: responseMessage.success,
          data: result ?? null,
        };
      }),
    );
  }
}
