import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

import { booleanTransformer } from '../utils';
import { IsAfterDate, IsValidFileSGDate } from '../validators';

export type ArrayOneOrMore<T> = {
  0: T;
} & Array<T>;

export class Timestamp {
  @ApiProperty()
  createdAt: Date;
}

export class OtpDetailsResponse {
  @ApiProperty({ type: Date, nullable: true })
  allowResendAt: Date | null;

  @ApiProperty()
  expireAt: Date;

  @ApiProperty()
  hasReachedOtpMaxResend: boolean;

  @ApiProperty()
  hasSentOtp: boolean;
}

export class PaginationOptions {
  @ApiPropertyOptional({ minimum: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(booleanTransformer('extended'))
  @IsBoolean()
  ignoreNull?: boolean;
}

export class DateStringRange {
  @IsValidFileSGDate({ allowEmptyMonthDay: false, allowedDate: 'PAST' })
  @ApiProperty({ example: '1995-01-01' })
  startDate: string;

  @IsAfterDate('startDate', true)
  @IsValidFileSGDate({ allowEmptyMonthDay: false, allowedDate: 'ANY' })
  @ApiProperty({ example: '1995-01-01' })
  endDate: string;
}

export class TraceIdResponse<T> {
  data: T;
  traceId: string;
}
