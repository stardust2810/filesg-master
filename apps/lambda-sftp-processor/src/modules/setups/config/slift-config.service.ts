import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

@Injectable()
export class SliftConfigService {
  constructor(private configService: ConfigService<SliftEnvironmentVariables>) {}

  get sliftDir() {
    return this.configService.get('SLIFT_DIR', { infer: true })!;
  }
}

export class SliftEnvironmentVariables {
  @Expose()
  @IsString()
  @IsNotEmpty()
  SLIFT_DIR: string;
}
