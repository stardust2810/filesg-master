import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtNonSingpass2faStrategy } from '../../../common/strategies/jwt-non-singpass-2fa.strategy';
import { JwtNonSingpassContentRetrievalStrategy } from '../../../common/strategies/jwt-non-singpass-content-retrieval.strategy';
import { JwtVerifyFileRetrievalStrategy } from '../../../common/strategies/jwt-verify-file-retrieval.strategy';
import { AgencyEntityModule } from '../../entities/agency/agency.entity.module';
import { AuditEventEntityModule } from '../../entities/audit-event/audit-event.entity.module';
import { UserEntityModule } from '../../entities/user/user.entity.module';
import { FileSGConfigModule } from '../../setups/config/config.module';
import { FileSGConfigService } from '../../setups/config/config.service';
import { AgencyClientModule } from '../agency-client/agency-client.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CorppassProvider } from './corppass.provider';
import { CorppassAuthController } from './corppass-auth.controller';
import { CorppassAuthService } from './corppass-auth.service';
import { MyinfoProvider } from './myinfo.provider';
import { SingpassProvider } from './singpass.provider';
@Module({
  imports: [
    UserEntityModule,
    AgencyEntityModule,
    PassportModule,
    AgencyClientModule,
    AuditEventEntityModule,
    JwtModule.registerAsync({
      imports: [FileSGConfigModule],
      useFactory: async (configService: FileSGConfigService) => ({
        secret: configService.authConfig.jwtAccessTokenSecret,
      }),
      inject: [FileSGConfigService],
    }),
  ],
  providers: [
    AuthService,
    CorppassAuthService,
    JwtNonSingpass2faStrategy,
    JwtNonSingpassContentRetrievalStrategy,
    JwtVerifyFileRetrievalStrategy,
    SingpassProvider,
    CorppassProvider,
    MyinfoProvider,
  ],
  controllers: [AuthController, CorppassAuthController],
  exports: [AuthService],
})
export class AuthModule {}
