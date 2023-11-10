import { Controller, Get, Logger, Param } from '@nestjs/common';

import { FileUploadAuthService } from './file-upload-auth.service';

@Controller('v1/file-upload-auth')
export class FileUploadAuthController {
  private readonly logger = new Logger(FileUploadAuthController.name);

  constructor(private readonly fileUploadAuthService: FileUploadAuthService) {}

  @Get(':fileSessionId')
  async checkAndDeleteExistingSession(@Param('fileSessionId') fileSessionId: string) {
    this.logger.log(`Retrieving file session with id of ${fileSessionId}`);
    return await this.fileUploadAuthService.checkAndDeleteExistingSession(fileSessionId);
  }
}
