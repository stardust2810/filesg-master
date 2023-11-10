import { Controller, Get, Logger, Param } from '@nestjs/common';

import { TransferInfoService } from './transfer-info.service';

@Controller('v1/transfer-info')
export class TransferInfoController {
  private readonly logger = new Logger(TransferInfoController.name);

  constructor(private readonly transferInfoService: TransferInfoService) {}

  @Get(':fileSessionId')
  async retrieveTransferInfo(@Param('fileSessionId') fileSessionId: string) {
    this.logger.log(`Retrieving file session with id of ${fileSessionId}`);
    return await this.transferInfoService.retrieveFileSessionInfo(fileSessionId);
  }
}
