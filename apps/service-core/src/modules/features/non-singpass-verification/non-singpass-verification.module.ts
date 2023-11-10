import { Module } from '@nestjs/common';

import { ActivityEntityModule } from '../../entities/activity/activity.entity.module';
import { AuditEventEntityModule } from '../../entities/audit-event/audit-event.entity.module';
import { AuthModule } from '../auth/auth.module';
import { OtpModule } from '../otp/otp.module';
import { NonSingpassVerificationController } from './non-singpass-verification.controller';
import { NonSingpassVerificationService } from './non-singpass-verification.service';

@Module({
  imports: [OtpModule, AuthModule, ActivityEntityModule, AuditEventEntityModule],
  providers: [NonSingpassVerificationService],
  controllers: [NonSingpassVerificationController],
  exports: [NonSingpassVerificationService],
})
export class NonSingpassVerificationModule {}
