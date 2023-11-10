import { SmService as BaseSmService } from '@filesg/aws';
import { LogMethod } from '@filesg/backend-common';
import { Injectable, Logger } from '@nestjs/common';

import { SMGetSecretException } from '../../../common/custom-exceptions';

@Injectable()
export class SmService {
  private readonly logger = new Logger(SmService.name);

  constructor(private readonly baseSmService: BaseSmService) {}

  @LogMethod()
  public async getSecretValue(key: string): Promise<string> {
    const { SecretString: value } = await this.baseSmService.getSecretValue(key);

    if (!value) {
      throw new SMGetSecretException(`Expecting the value for key: ${key} to be not empty`);
    }

    return value;
  }
}
