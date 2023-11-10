import { ForbiddenException, JWT_TYPE } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { FileSGConfigService } from '../../modules/setups/config/config.service';
import { FileDownloadJwtPayload } from '../../typings/common';

@Injectable()
export class JwtFileDownloadStrategy extends PassportStrategy(Strategy, 'jwt-file-download') {
  constructor(fileSgConfigServce: FileSGConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: fileSgConfigServce.jwtConfig.accessTokenSecret,
    });
  }

  async validate(payload: FileDownloadJwtPayload) {
    if (payload.type !== JWT_TYPE.FILE_DOWNLOAD) {
      throw new ForbiddenException(COMPONENT_ERROR_CODE.JWT_FILE_DOWNLOAD_STRATEGY);
    }

    return {
      fileSessionId: payload.fileSessionId,
    };
  }
}
