import { ErrorsInterceptor } from '@filesg/backend-common';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

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
  ],
})
export class InterceptorModule {}
