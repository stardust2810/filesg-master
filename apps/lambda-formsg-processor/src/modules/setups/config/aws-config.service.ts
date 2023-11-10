import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Injectable()
export class AWSConfigService {
  constructor(private configService: ConfigService<AWSEnvironmentVariables>) {}

  get region() {
    return this.configService.get('AWS_REGION', { infer: true })!;
  }

  // get formSgRoleArn() {
  //   return this.configService.get('AWS_IAM_FORMSG_ROLE_ARN', { infer: true })!;
  // }

  // get assumeRoleSessionDuration() {
  //   return this.configService.get('AWS_STS_ASSUME_ROLE_SESSION_DURATION', { infer: true })!;
  // }
}

export class AWSEnvironmentVariables {
  @Expose()
  @IsString()
  AWS_REGION: string;

  // @Expose()
  // @IsString()
  // AWS_IAM_FORMSG_ROLE_ARN: string;

  // @Expose()
  // @IsNumber()
  // AWS_STS_ASSUME_ROLE_SESSION_DURATION: number;
}
