import { redactUinfin } from '@filesg/common';
import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { FileSGBaseException, FileSGBaseHttpException, InputValidationException } from '../filters/custom-exception.filter';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err instanceof FileSGBaseException || err instanceof FileSGBaseHttpException) {
          const internalLog = err.internalLog ? redactUinfin(err.internalLog) : err.internalLog;
          if (err instanceof InputValidationException) {
            this.logger[err.errorLogLevel]({ errorMsg: err.getResponse(), ...(internalLog && { internalLog }) });
          } else {
            this.logger[err.errorLogLevel]({ errorMsg: err.message, ...(internalLog && { internalLog }) });
          }
        } else {
          this.logger.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));
          return throwError(
            () =>
              new HttpException(
                `Encountered an unexpected error while processing the request. Please contact FileSG Support with traceId`,
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
