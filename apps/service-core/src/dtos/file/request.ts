import { InputValidationException } from '@filesg/backend-common';
import {
  booleanTransformer,
  COMPONENT_ERROR_CODE,
  FILE_ASSET_ACTION,
  IsValidUin,
  Metadata,
  PaginationOptions,
  SORT_BY,
  VIEWABLE_FILE_STATUSES,
  ViewableFileStatus,
} from '@filesg/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class AllFileAssetsRequestDto extends PaginationOptions {
  @ApiProperty({ enum: SORT_BY })
  @IsNotEmpty()
  @IsEnum(SORT_BY)
  sortBy: SORT_BY;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(booleanTransformer('strict'), { toClassOnly: true })
  @IsBoolean({ message: 'asc has to be either "true" or "false"' })
  asc: boolean;

  @ApiProperty({ isArray: true, enum: VIEWABLE_FILE_STATUSES })
  @Transform(({ value }) => (value as string).split(','))
  @IsIn(VIEWABLE_FILE_STATUSES, { each: true })
  @ArrayNotEmpty()
  statuses: ViewableFileStatus[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  externalRefId?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: `The JSON object must be stringified and URI-encoded before it is passed to the endpoint as a string value.`,
  })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch (err) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.VALIDATION_PIPE, 'Invalid json for the provided metadata.');
    }
  })
  @IsNotEmptyObject()
  metadata?: Metadata;
}

export class AllFileAssetsFromCitizenRequestDto extends AllFileAssetsRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  agencyCode?: string;
}

export class AllFileAssetsFromAgencyRequestDto extends AllFileAssetsRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsValidUin()
  user: string;
}

export class AllFileAssetUuidsRequestDto extends AllFileAssetsRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  agencyCode?: string;
}

export class FileDownloadRequest {
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsArray()
  @ArrayUnique()
  @ApiProperty({ type: String, isArray: true })
  uuid: string[];
}

export class FileAssetHistoryRequestDto extends PaginationOptions {
  @IsArray()
  @IsOptional()
  @ArrayUnique()
  @IsEnum(FILE_ASSET_ACTION, { each: true })
  @ApiProperty({ enum: FILE_ASSET_ACTION, isArray: true })
  type?: FILE_ASSET_ACTION[];
}

export class FileAssetAccessToken {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string;
}
