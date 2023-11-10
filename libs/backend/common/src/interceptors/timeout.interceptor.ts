import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

import { RequestTimeoutException } from '../filters/custom-exception.filter';

const TIMEOUT_MS_DEFAULT = 5 * 1000;

export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutMs = TIMEOUT_MS_DEFAULT) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException(COMPONENT_ERROR_CODE.TIMEOUT_INTERCEPTOR));
        }
        return throwError(() => err);
      }),
    );
  }
}
