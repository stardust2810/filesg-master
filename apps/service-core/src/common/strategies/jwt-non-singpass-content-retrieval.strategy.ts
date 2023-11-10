import { ForbiddenException, JWT_TYPE } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AUTH_STRATEGY_NAME } from '../../consts';
import { FileSGConfigService } from '../../modules/setups/config/config.service';
import { NonSingpassContentRetrievalPayload } from '../../typings/common';

@Injectable()
export class JwtNonSingpassContentRetrievalStrategy extends PassportStrategy(
  Strategy,
  AUTH_STRATEGY_NAME.JWT_NON_SINGPASS_CONTENT_RETRIEVAL,
) {
  private readonly logger = new Logger(JwtNonSingpassContentRetrievalStrategy.name);

  constructor(configService: FileSGConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.authConfig.jwtAccessTokenSecret,
    });
  }

  async validate(payload: NonSingpassContentRetrievalPayload) {
    if (payload.type !== JWT_TYPE.NON_SINGPASS_CONTENT_RETRIEVAL) {
      throw new ForbiddenException(COMPONENT_ERROR_CODE.JWT_NON_SINGPASS_CONTENT_RETRIEVAL_STRATEGY);
    }

    const { sessionId, activityUuid, userId, userUuid } = payload;
    return { sessionId, activityUuid, userId, userUuid };
  }
}
