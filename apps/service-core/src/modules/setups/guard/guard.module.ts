import { DisableHandlerGuard } from '@filesg/backend-common';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthGuard } from '../../../common/guards/auth.guard';
import { UserEntityModule } from '../../entities/user/user.entity.module';
import { AuthModule } from '../../features/auth/auth.module';
import { UserService } from '../../features/user/user.service';

@Module({
  imports: [UserEntityModule, AuthModule],
  providers: [
    { provide: APP_GUARD, useClass: DisableHandlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard, inject: [UserService] },
  ],
})
export class GuardModule {}
