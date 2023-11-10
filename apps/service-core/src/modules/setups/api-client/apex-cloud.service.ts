import { Injectable, Logger } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import { FileSGConfigService } from '../config/config.service';

@Injectable()
export class ApexCloudService {
  private logger = new Logger(ApexCloudService.name);

  constructor(private readonly fileSGConfigService: FileSGConfigService, private readonly jwtService: JwtService) {}

  public getJwt(sub: string, aud: string, hash: string): string {
    const { apexIntranetApiKey, apexJwksPrivateKey, apexJwksKeyId } = this.fileSGConfigService.apexConfig;
    const signOptions: JwtSignOptions = {
      algorithm: 'ES256',
      keyid: apexJwksKeyId,
      expiresIn: '180s',
      jwtid: uuidv4(),
      issuer: apexIntranetApiKey,
      audience: aud,
      subject: sub.toUpperCase(),
      privateKey: apexJwksPrivateKey,
    };
    const payload = {
      data: hash,
    };

    return this.jwtService.sign(payload, signOptions);
  }
}
