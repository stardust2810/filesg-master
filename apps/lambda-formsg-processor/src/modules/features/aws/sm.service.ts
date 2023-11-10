import { AwsSmGetSecretException, SmService as BaseSmService } from '@filesg/aws';
import { Injectable, Logger } from '@nestjs/common';

type Key = string;
type SecretValue = string;

@Injectable()
export class SmService {
  private readonly logger = new Logger(SmService.name);
  private readonly secretsCache: Record<Key, SecretValue> = {};

  constructor(private readonly baseSmService: BaseSmService) {}

  public async getSecretValue(key: Key): Promise<SecretValue> {
    if (this.secretsCache[key]) {
      return this.secretsCache[key];
    }

    const { SecretString: value } = await this.baseSmService.getSecretValue(key);

    if (!value) {
      throw new AwsSmGetSecretException(`Expecting the value for key: ${key} to be not empty`);
    }

    this.secretsCache[key] = value;
    return value;
  }
}
