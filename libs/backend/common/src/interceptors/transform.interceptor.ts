import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * This interceptor will be kept but disabled until special serialization required
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor<Record<string, any>, Record<string, any>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Record<string, any>> {
    const contextHttp = context.switchToHttp();
    const { originalUrl } = contextHttp.getRequest<Request>();

    if (
      originalUrl.startsWith('/api/core/v1/open-attestation/revocation-status') ||
      originalUrl.startsWith('/api/core/v1/open-attestation/verify')
    ) {
      return next.handle().pipe();
    }

    return next.handle().pipe(map((data) => classToPlain(data)));
  }
}
