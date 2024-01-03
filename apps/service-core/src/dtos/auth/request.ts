import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  authCode: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  nonce: string;
}

export class MockCorppassLoginRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  uin: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  uen: string;

  @ApiProperty({ required: false, isArray: true })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  roles: string[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  nonce: string;
}

export class ProgrammaticAuthRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  clientId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  secret: string;
}
