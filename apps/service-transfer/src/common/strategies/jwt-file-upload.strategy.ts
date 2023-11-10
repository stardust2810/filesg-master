import { FileUploadJwtPayload, ForbiddenException, JWT_TYPE } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { FileSGConfigService } from '../../modules/setups/config/config.service';

@Injectable()
export class JwtFileUploadStrategy extends PassportStrategy(Strategy, 'jwt-file-upload') {
  constructor(fileSgConfigServce: FileSGConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: fileSgConfigServce.jwtConfig.accessTokenSecret,
    });
  }

  async validate(payload: FileUploadJwtPayload) {
    if (payload.type !== JWT_TYPE.FILE_UPLOAD) {
      throw new ForbiddenException(COMPONENT_ERROR_CODE.JWT_FILE_UPLOAD_STRATEGY);
    }

    // eslint-disable-next-line unused-imports/no-unused-vars
    const { type, ...rest } = payload;
    return rest;
  }
}
