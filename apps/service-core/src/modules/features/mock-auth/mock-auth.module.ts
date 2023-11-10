import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuditEventEntityModule } from '../../entities/audit-event/audit-event.entity.module';
import { UserEntityModule } from '../../entities/user/user.entity.module';
import { AuthModule } from '../auth/auth.module';
import { MockAuthController } from './mock-auth.controller';
import { MockAuthService } from './mock-auth.service';

@Module({
  imports: [UserEntityModule, PassportModule, AuthModule, AuditEventEntityModule],
  providers: [MockAuthService],
  controllers: [MockAuthController],
  exports: [MockAuthService],
})
export class MockAuthModule {}
