import { Controller, Get, Logger, Param } from '@nestjs/common';

import { FileDownloadService } from './file-download.service';

@Controller('v1/file-download')
export class FileDownloadController {
  private readonly logger = new Logger(FileDownloadController.name);

  constructor(private readonly fileDownloadService: FileDownloadService) {}

  @Get(':fileSessionId')
  async retrieveTransferInfo(@Param('fileSessionId') fileSessionId: string) {
    this.logger.log(`Retrieving file session with id of ${fileSessionId}`);
    return await this.fileDownloadService.retrieveDownloadInfo(fileSessionId);
  }
}
