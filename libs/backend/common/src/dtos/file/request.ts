import { IsValidUin } from '@filesg/common';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsOptional, IsString } from 'class-validator';

export class EserviceFileDownloadRequest {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @ArrayUnique()
  @ApiProperty({ type: String, isArray: true, example: ['fileasset-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxx'] })
  fileAssetUuids: string[];

  @IsValidUin()
  @IsOptional()
  @ApiProperty({ description: 'Please provide the UIN only if the individual is a recipient of the file.', example: 'S7800000A' })
  userUin?: string;
}
