import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

// CIRIS MMBS Biometric retrieval v0.1
export class BioRegistrationKeyDto {
  @IsString()
  @IsOptional()
  applicationRefNo: string | null;

  @IsString()
  @IsOptional()
  majorRefNo: string | null;

  @IsString()
  @IsOptional()
  minorRefNo: string | null;

  @IsString()
  @IsOptional()
  registrationId: string | null;
}

export class BioRegistrationDto {
  @IsString()
  @IsNotEmpty()
  secondaryExternalId: string; // FIN
}

export class BioRegistrationFilterDto {
  @IsBoolean()
  @IsOptional()
  includeFaces: boolean; // Set true to get facial image

  @IsObject()
  @IsNotEmptyObject()
  registrationInfoDto: BioRegistrationDto;

  @IsObject()
  @IsNotEmptyObject()
  registrationKey: BioRegistrationKeyDto;
}

export class CirisRetrieveBiometricsApiRequest {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsArray()
  @IsString({ each: true })
  datasourceList: string[];

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  recordCount: number;

  @IsObject()
  @IsNotEmptyObject()
  registrationFilter: BioRegistrationFilterDto;
}

export class AgencyClientPhotoRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oaDocument: string;
}

export class CirisRetrieveJwtRequest {
  @IsString()
  @IsNotEmpty()
  systemId: string;

  @IsString()
  @IsNotEmpty()
  systemPw: string;
}
