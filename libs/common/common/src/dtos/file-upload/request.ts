import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsString, ValidateIf, ValidateNested } from 'class-validator';

import { OA_TYPE } from '../../constants/common';
import { EitherOr, IsValidFilename } from '../../validators';

export class S3FileData {
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the S3 bucket where the file is stored.',
    example: 'my-documents-bucket',
  })
  bucketName: string;

  @IsNotEmpty()
  @ApiProperty({
    description:
      'The path and name of the file within the S3 bucket. This should include any subfolders or directories leading up to the file.',
    example: 'documents/user-data/john-doe.pdf',
  })
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
  @ApiProperty({ description: 'Provide the same file name that was used to create transaction', example: 'invoice.pdf' })
  fileName: string;

  @IsNotEmpty()
  @Type(() => Boolean)
  @ApiProperty({ description: 'Set to true if the file is of type of OA' })
  isOA: boolean;

  @ValidateIf((val) => val.isOA)
  @IsNotEmpty()
  @IsEnum(OA_TYPE)
  @ApiPropertyOptional({
    enum: OA_TYPE,
    description: 'Must be provided only when isOA is true. OA Type will be finalized upon onboarding.',
  })
  oaType?: OA_TYPE;

  @ValidateIf((val) => val.isOA || !val.s3FileData || !!val.fileData)
  @EitherOr('s3FileData')
  @IsNotEmpty()
  @IsString()
  @ApiPropertyOptional({
    description: 'Provide the file data as base64. Exactly one of the fileData or S3FileData properties must be provided.',
    type: 'string',
    format: 'base64',
    example: '<base64 value of the document>',
  })
  fileData?: string;

  @ValidateIf((val) => !val.isOA && (!val.fileData || !!val.s3FileData))
  @EitherOr('fileData')
  @ValidateNested()
  @Type(() => S3FileData)
  @ApiPropertyOptional({
    description: 'Provide the S3 file details. Exactly one of the fileData or S3FileData properties must be provided.',
    type: S3FileData,
  })
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
