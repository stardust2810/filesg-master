import { Module } from '@nestjs/common';

import { UserEntityModule } from '../../entities/user/user.entity.module';
import { OtpModule } from '../otp/otp.module';
import { UserModule } from '../user/user.module';
import { UserContactUpdateController } from './user-contact-update.controller';
import { UserContactUpdateService } from './user-contact-update.service';

@Module({
  imports: [UserModule, UserEntityModule, OtpModule],
  controllers: [UserContactUpdateController],
  providers: [UserContactUpdateService],
  exports: [UserContactUpdateService],
})
export class UserContactUpdateModule {}
