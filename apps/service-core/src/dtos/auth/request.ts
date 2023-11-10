import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  role: string;

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
