import { booleanTransformer } from '@filesg/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class FormSgIssuanceReportRequest {
  @ApiProperty()
  @IsOptional()
  @Transform(booleanTransformer('strict'), { toClassOnly: true })
  @IsBoolean({ message: 'includeFailureDetails has to be either "true" or "false"' })
  excludeFailureDetails: boolean;
}
