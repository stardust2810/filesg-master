import { GetSecretValueCommandOutput, SecretsManager } from '@aws-sdk/client-secrets-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { SM_CLIENT } from '../../typings/sm.typing';

@Injectable()
export class SmService {
  private readonly logger = new Logger(SmService.name);
  constructor(@Inject(SM_CLIENT) private readonly secretManager: SecretsManager) {}

  public async getSecretValue(key: string): Promise<GetSecretValueCommandOutput> {
    return await this.secretManager.getSecretValue({ SecretId: key });
  }
}
