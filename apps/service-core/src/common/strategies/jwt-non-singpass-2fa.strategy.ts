import { ForbiddenException, JWT_TYPE } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AUTH_STRATEGY_NAME } from '../../consts';
import { FileSGConfigService } from '../../modules/setups/config/config.service';
import { NonSingpass2FaJwtPayload } from '../../typings/common';

@Injectable()
export class JwtNonSingpass2faStrategy extends PassportStrategy(Strategy, AUTH_STRATEGY_NAME.JWT_NON_SINGPASS_2FA) {
  constructor(configService: FileSGConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.authConfig.jwtAccessTokenSecret,
    });
  }

  async validate(payload: NonSingpass2FaJwtPayload) {
    if (payload.type !== JWT_TYPE.NON_SINGPASS_2FA) {
      throw new ForbiddenException(COMPONENT_ERROR_CODE.JWT_NON_SINGPASS_2FA_STRATEGY);
    }

    const { activityUuid } = payload;
    return { activityUuid };
  }
}
