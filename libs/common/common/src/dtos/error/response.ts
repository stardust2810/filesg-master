import { ApiProperty } from '@nestjs/swagger';

export class FileSGErrorResponse {
  @ApiProperty({ description: 'String | Record<string, any>' })
  message: string | Record<string, any>;

  @ApiProperty()
  errorCode: string;
}

export class ErrorResponse {
  @ApiProperty({ type: FileSGErrorResponse })
  data: FileSGErrorResponse;

  @ApiProperty()
  traceId: string;

  @ApiProperty()
  pathName: string;

  @ApiProperty({ type: Date })
  timestamp: Date;
}
