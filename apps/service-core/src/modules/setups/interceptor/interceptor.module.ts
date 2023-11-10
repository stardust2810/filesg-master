import { ErrorsInterceptor } from '@filesg/backend-common';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { CsrfInterceptor } from '../../../common/interceptors/csrf.interceptor';

/**
 * Order of inteceptors works like a call stack, in order of the interceptors in the InterceptorModule's provider array.
 *
 * E.g. for [Interceptor 1, Interceptor 2]:
 * 1. Interceptor 1 (intercept)
 * 2. Interceptor 2 (intercept)
 * 3. next.handle()
 * 4. Interceptor 2 (pipe op)
 * 5. Interceptor 1 (pipe op)
 *
 * https://stackoverflow.com/questions/59346812/clarification-regarding-nestjs-interceptors-order-of-execution
 *
 * IMPORTANT: Errorinterceptor on top, because should catch all errors, including those from other interceptors
 */
@Module({
  providers: [
    // Disabling transform interceptor until there is a need for special serialization
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: TransformInterceptor,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorsInterceptor,
    },
    // Disabling the timeout interceptor as it is not helpful to stop the long invocation time. when the api return 408 due to timeout, the downstream invocation will still continue running in the background.
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: TimeoutInterceptor,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: CsrfInterceptor,
    },
  ],
})
export class InterceptorModule {}
