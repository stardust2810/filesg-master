import 'pino-http';

import { FileSGErrorResponse, SERVICE_NAME } from '@filesg/common';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { Request, Response } from 'express';

import { FileSGBaseHttpException } from './custom-exception.filter';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  constructor(private readonly serviceName: SERVICE_NAME) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    /**
     * [IMPORTANT] To bypass error "Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client"
     *
     * During streaming, when abort signal is sent, pipeline will close and throw 'Premature Close' error and will be caught here.
     * response.status will attempt to set status code to a response that has already 'returned' and throw the above error,
     * causing the service to crash.
     */
    if (response.headersSent) {
      return;
    }

    const request = ctx.getRequest<Request>();
    let status, data;

    switch (true) {
      case exception instanceof FileSGBaseHttpException:
      case exception instanceof ServiceUnavailableException: {
        status = exception.getStatus();
        const { message, errorCode } = exception.getResponse() as FileSGErrorResponse;
        const fullErrorCode = `${this.serviceName}-${errorCode}`;

        if (typeof message === 'string') {
          data = { message, errorCode: fullErrorCode };
        } else {
          data = { ...message, errorCode: fullErrorCode };
        }

        break;
      }
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        data = exception.message;
    }

    /**
     * To bypass error "Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client"
     */
    if (!response.headersSent) {
      response.status(status).json({
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
        traceId: request.id,
      });
    }
  }
}
