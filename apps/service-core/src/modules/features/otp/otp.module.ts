import { Module } from '@nestjs/common';

import { AwsModule } from '../aws/aws.module';
import { NotificationModule } from '../notification/notification.module';
import { OtpService } from './otp.service';

@Module({
  imports: [AwsModule, NotificationModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
