import { InputValidationException } from '@filesg/backend-common';
import {
  booleanTransformer,
  COMPONENT_ERROR_CODE,
  FILE_ACCESS_TOKEN_SIGNATURE_REGEX,
  FILE_ASSET_ACTION,
  FILE_ASSET_SORT_BY,
  FILE_ASSET_UUID_SIGNATURE_REGEX,
  IsValidUin,
  Metadata,
  PaginationOptions,
  PATH_TRAVERSAL_REGEX,
  queryParamArrayTransformer,
  USER_UUID_SIGNATURE_REGEX,
  VIEWABLE_FILE_STATUSES,
  ViewableFileStatus,
} from '@filesg/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  Matches,
} from 'class-validator';

export class AllFileAssetsRequestDto extends PaginationOptions {
  @ApiProperty({ enum: FILE_ASSET_SORT_BY, example: FILE_ASSET_SORT_BY.CREATED_AT })
  @IsNotEmpty()
  @IsEnum(FILE_ASSET_SORT_BY)
  sortBy: FILE_ASSET_SORT_BY;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(booleanTransformer('strict'), { toClassOnly: true })
  @IsBoolean({ message: 'asc has to be either "true" or "false"' })
  asc: boolean;

  @ApiProperty({ isArray: true, enum: VIEWABLE_FILE_STATUSES, example: VIEWABLE_FILE_STATUSES[0] })
  @Transform(queryParamArrayTransformer)
  @ArrayNotEmpty()
  @IsArray()
  @IsIn(VIEWABLE_FILE_STATUSES, { each: true })
  statuses: ViewableFileStatus[];

  @ApiPropertyOptional({ example: 'TXN202311211453012345' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  externalRefId?: string;

  @ApiPropertyOptional({
    description: `The JSON object must be stringified and URI-encoded before it is passed to the endpoint as a string value.`,
    example: { isGuardian: true },
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
  @ApiProperty({ required: false, isArray: true })
  @IsOptional()
  @Transform(queryParamArrayTransformer)
  @ArrayNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @Matches(PATH_TRAVERSAL_REGEX, { message: 'Agency code should only contain alphabets', each: true })
  agencyCodes?: string[];
}

export class AllFileAssetsFromCorporateRequestDto extends AllFileAssetsRequestDto {
  @ApiProperty({ required: false, isArray: true })
  @IsOptional()
  @Transform(queryParamArrayTransformer)
  @ArrayNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @Matches(PATH_TRAVERSAL_REGEX, { message: 'Agency code should only contain alphabets', each: true })
  agencyCodes?: string[];
}

export class AllFileAssetsFromAgencyRequestDto extends AllFileAssetsRequestDto {
  @ApiProperty({ example: 'S7800000A' })
  @IsNotEmpty()
  @IsValidUin()
  user: string;
}

export class AllFileAssetUuidsRequestDto {
  @ApiProperty({ required: false, isArray: true })
  @IsOptional()
  @Transform(queryParamArrayTransformer)
  @ArrayNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @Matches(PATH_TRAVERSAL_REGEX, { message: 'Agency code should only contain alphabets', each: true })
  agencyCodes?: string[];

  @ApiProperty({ enum: FILE_ASSET_SORT_BY, example: FILE_ASSET_SORT_BY.CREATED_AT })
  @IsNotEmpty()
  @IsEnum(FILE_ASSET_SORT_BY)
  sortBy: FILE_ASSET_SORT_BY;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(booleanTransformer('strict'), { toClassOnly: true })
  @IsBoolean({ message: 'asc has to be either "true" or "false"' })
  asc: boolean;

  @ApiProperty({ isArray: true, enum: VIEWABLE_FILE_STATUSES, example: VIEWABLE_FILE_STATUSES[0] })
  @Transform(queryParamArrayTransformer)
  @ArrayNotEmpty()
  @IsArray()
  @IsIn(VIEWABLE_FILE_STATUSES, { each: true })
  statuses: ViewableFileStatus[];
}

export class GenerateFilesDownloadTokenRequest {
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  @ArrayNotEmpty()
  @ApiProperty({ type: String, isArray: true })
  uuids: string[];
}

export class FileAssetHistoryRequestDto extends PaginationOptions {
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayNotEmpty()
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

export class FileAccessQrData {
  @IsString()
  @IsNotEmpty()
  @Matches(FILE_ASSET_UUID_SIGNATURE_REGEX)
  fileAssetUuid: string;

  @IsString()
  @IsNotEmpty()
  @Matches(USER_UUID_SIGNATURE_REGEX)
  userUuid: string;

  @IsString()
  @IsNotEmpty()
  @Matches(FILE_ACCESS_TOKEN_SIGNATURE_REGEX)
  token: string;
}
