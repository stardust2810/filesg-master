import { booleanTransformer, numberTransformer } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose, Transform } from 'class-transformer';
import { IsBoolean, IsByteLength, IsNumber, IsString } from 'class-validator';

@Injectable()
export class DatabaseConfigService {
  constructor(private configService: ConfigService<DatabaseEnvironmentVariables>) {}

  get host() {
    return this.configService.get('DB_HOST', { infer: true })!;
  }
  get port() {
    return this.configService.get('DB_PORT', { infer: true })!;
  }
  get name() {
    return this.configService.get('DB_NAME', { infer: true })!;
  }
  get username() {
    return this.configService.get('DB_USERNAME', { infer: true })!;
  }
  get password() {
    return this.configService.get('DB_PASSWORD', { infer: true })!;
  }
  get migrationsRun() {
    return this.configService.get('DB_MIGRATIONS_RUN', { infer: true })!;
  }
  get retryAttempts() {
    return this.configService.get('DB_RETRY_ATTEMPTS', { infer: true })!;
  }
  get logging() {
    return this.configService.get('DB_LOGGING', { infer: true })!;
  }
  get poolWaitForConnections() {
    return this.configService.get('DB_POOL_WAIT_FOR_CONNECTIONS', { infer: true })!;
  }
  get poolConnectionLimit() {
    return this.configService.get('DB_POOL_CONNECTION_LIMIT', { infer: true })!;
  }
  get poolQueueLimit() {
    return this.configService.get('DB_POOL_QUEUE_LIMIT', { infer: true })!;
  }
  get fieldEncryptionKey() {
    return this.configService.get('DB_FIELD_ENCRYPTION_KEY', { infer: true });
  }
  get fieldEncryptionAlgo() {
    return this.configService.get('DB_FIELD_ENCRYPTION_ALGO', { infer: true })!;
  }
  get fieldEncryptionIv() {
    return this.configService.get('DB_FIELD_ENCRYPTION_IV', { infer: true });
  }
  get fieldEncryptionIvLength() {
    return this.configService.get('DB_FIELD_ENCRYPTION_IV_LENGTH', { infer: true });
  }
}

export class DatabaseEnvironmentVariables {
  @Expose()
  @IsString()
  DB_HOST: string;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  DB_PORT: number;

  @Expose()
  @IsString()
  DB_NAME: string;

  @Expose()
  @IsString()
  DB_USERNAME: string;

  @Expose()
  @IsString()
  DB_PASSWORD: string;

  @Transform(booleanTransformer('extended'))
  @Expose()
  @IsBoolean()
  DB_MIGRATIONS_RUN: boolean;

  @Transform(booleanTransformer('extended'))
  @Expose()
  @IsBoolean()
  DB_LOGGING: boolean;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  DB_RETRY_ATTEMPTS: number;

  @Transform(booleanTransformer('extended'))
  @Expose()
  @IsBoolean()
  DB_POOL_WAIT_FOR_CONNECTIONS: boolean;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  DB_POOL_CONNECTION_LIMIT: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  DB_POOL_QUEUE_LIMIT: number;

  @Expose()
  @IsString()
  @IsByteLength(64, 64)
  DB_FIELD_ENCRYPTION_KEY: string;

  @Expose()
  @IsString()
  @IsByteLength(32, 32)
  DB_FIELD_ENCRYPTION_IV: string;

  @Expose()
  @IsString()
  DB_FIELD_ENCRYPTION_ALGO: string;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  DB_FIELD_ENCRYPTION_IV_LENGTH: number;
}
