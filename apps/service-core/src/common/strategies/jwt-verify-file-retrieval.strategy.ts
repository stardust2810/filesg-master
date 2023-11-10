import { ForbiddenException, JWT_TYPE } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AUTH_STRATEGY_NAME } from '../../consts';
import { FileSGConfigService } from '../../modules/setups/config/config.service';
import { VerifyFileRetrievalPayload } from '../../typings/common';

@Injectable()
export class JwtVerifyFileRetrievalStrategy extends PassportStrategy(Strategy, AUTH_STRATEGY_NAME.JWT_VERIFY_FILE_RETRIEVAL) {
  private readonly logger = new Logger(JwtVerifyFileRetrievalStrategy.name);

  constructor(configService: FileSGConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.authConfig.jwtVerifyTokenSecret,
    });
  }

  async validate(payload: VerifyFileRetrievalPayload) {
    if (payload.type !== JWT_TYPE.VERIFY) {
      throw new ForbiddenException(COMPONENT_ERROR_CODE.JWT_VERIFY_FILE_RETRIEVAL_STRATEGY);
    }

    const { fileAssetUuid, userUuid } = payload;
    return { fileAssetUuid, userUuid };
  }
}
