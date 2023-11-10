import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsString, ValidateIf, ValidateNested } from 'class-validator';

import { OA_TYPE } from '../../constants/common';
import { EitherOr, IsValidFilename } from '../../validators';

export class S3FileData {
  @IsNotEmpty()
  @ApiProperty()
  bucketName: string;

  @IsNotEmpty()
  @ApiProperty()
  key: string;
}

/**
 * fileData and s3FileData are mutually exclusive and at least one must be provided
 *  if isOA, then fileData must be presented
 */
export class File {
  @IsNotEmpty()
  @IsString()
  @IsValidFilename()
  @ApiProperty()
  fileName: string;

  @IsNotEmpty()
  @Type(() => Boolean)
  @ApiProperty()
  isOA: boolean;

  @ValidateIf((val) => val.isOA)
  @IsNotEmpty()
  @IsEnum(OA_TYPE)
  @ApiProperty({ required: false, description: 'Must be provided only when isOA is true. OA Type will be finalized upon onboarding.' })
  oaType?: OA_TYPE;

  @ValidateIf((val) => val.isOA || !val.s3FileData || !!val.fileData)
  @EitherOr('s3FileData')
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: false, description: 'Provide the file data as base64' })
  fileData?: string;

  @ValidateIf((val) => !val.isOA && (!val.fileData || !!val.s3FileData))
  @EitherOr('fileData')
  @ValidateNested()
  @Type(() => S3FileData)
  @ApiProperty({ required: false, type: S3FileData })
  s3FileData?: S3FileData;
}

export class FilesUploadRequest {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested()
  @Type(() => File)
  @ApiProperty({ type: File, isArray: true })
  files: File[];
}
