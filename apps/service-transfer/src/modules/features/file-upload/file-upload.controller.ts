import { ERROR_RESPONSE_DESC, ErrorResponse, FilesUploadRequest } from '@filesg/common';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { JwtFileUploadAuthGuard } from '../../../common/guards/jwt-file-upload.guard';
import { FileUploadRequest } from '../../../typings/common';
import { FileUploadService } from './file-upload.service';

@Controller('v1/file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseGuards(JwtFileUploadAuthGuard)
  @ApiTags('apigw', 'tech-doc:issuance')
  @ApiOperation({
    summary: 'upload document.',
    description:
      'This API endpoint permits the agency to upload documents related to the transaction created using the `create transaction` API under `issuance` tag.',
  })
  @ApiBearerAuth('FileSGBearerToken')
  @ApiBody({ type: FilesUploadRequest })
  @ApiOkResponse({ type: String })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.JWT_UNAUTHORISED, type: ErrorResponse })
  async create(@Body() filesUploadObj: FilesUploadRequest, @Req() req: FileUploadRequest) {
    return await this.fileUploadService.fileUpload(filesUploadObj, req.user);
  }
}
