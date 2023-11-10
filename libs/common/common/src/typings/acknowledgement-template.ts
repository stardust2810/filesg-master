import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  arrayNotEmpty,
  IsArray,
  isArray,
  IsBoolean,
  isBoolean,
  isEmpty,
  IsEnum,
  isNotEmpty,
  IsOptional,
  IsString,
  isString,
  ValidateNested,
} from 'class-validator';

import { getTypeOptions } from '../utils';
import { EnhancedValidateIf } from '../validators';

export type ContentOnlyType = Omit<InstanceType<typeof ContentOnly>, 'type'>;
export type TitleWithContentType = Omit<InstanceType<typeof TitleWithContent>, 'type'>;

export type TemplateContent = (ContentOnlyType | TitleWithContentType)[];

export enum ContentType {
  ORDERED = 'ORDERED',
  UNORDERED = 'UNORDERED',
}

export class Base {
  type: 'ContentOnly' | 'TitleWithContent';
}

export class ContentOnly extends Base {
  override type: 'ContentOnly';

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @ApiProperty({ type: [String] })
  content: string[];

  @IsOptional()
  @IsEnum(ContentType)
  @ApiProperty({ enum: ContentType })
  contentType?: ContentType;
}

// @ApiExtraModels(ContentOnly, TitleWithContent)
export class TitleWithContent extends Base {
  override type: 'TitleWithContent';

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  isContentNumberingTitle?: boolean;

  @EnhancedValidateIf((obj) => !obj.isContentNumberingTitle, [isString, isNotEmpty], 'title must be a string and non-empty')
  @EnhancedValidateIf((obj) => obj.isContentNumberingTitle, [isEmpty], 'title must not be defined when isContentNumberingTitle is true')
  @ApiProperty()
  title: string;

  @IsOptional()
  @EnhancedValidateIf((obj) => !obj.isContentNumberingTitle, [isBoolean], 'isTitleBold must be a boolean')
  @EnhancedValidateIf(
    (obj) => obj.isContentNumberingTitle,
    [isEmpty],
    'isTitleBold must not be defined when isContentNumberingTitle is true',
  )
  @ApiPropertyOptional()
  isTitleBold?: boolean;

  @EnhancedValidateIf((obj) => !obj.isContentNumberingTitle, [isArray, arrayNotEmpty], 'content must be an array and non-empty')
  @EnhancedValidateIf((obj) => obj.isContentNumberingTitle, [isEmpty], 'content must not be defined when isContentNumberingTitle is true')
  @ValidateNested({ each: true })
  @Type(
    () => Base,
    getTypeOptions([
      { name: 'ContentOnly', value: ContentOnly },
      { name: 'TitleWithContent', value: TitleWithContent },
    ]),
  )
  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [{ $ref: getSchemaPath(ContentOnly) }, { $ref: getSchemaPath(TitleWithContent) }],
    },
  })
  content: TemplateContent;

  @EnhancedValidateIf(
    (obj) => obj.isContentNumberingTitle,
    [isArray, arrayNotEmpty],
    'numberingTitleContent must be an array and non-empty',
  )
  @EnhancedValidateIf(
    (obj) => !obj.isContentNumberingTitle,
    [isEmpty],
    'numberingTitleContent must not be defined when isContentNumberingTitle is false',
  )
  @ValidateNested({ each: true })
  @Type(() => Base, getTypeOptions([{ name: 'TitleWithContent', value: TitleWithContent }]))
  @ApiProperty({ type: () => [TitleWithContent] })
  numberingTitleContent: TitleWithContent[];
}
