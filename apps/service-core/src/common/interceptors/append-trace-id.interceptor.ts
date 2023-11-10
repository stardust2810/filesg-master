import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

/**
 * This interceptor is used to append traceId to the response.
 * The final response will be
 * {
 *    traceId: string
 *    data: response data from service
 * }
 * */

interface Response<T> {
  data: T;
  traceId: string;
}

@Injectable()
export class AppendTraceIdInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        traceId: context.switchToHttp().getRequest().id,
      })),
    );
  }
}
