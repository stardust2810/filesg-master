import { Module } from '@nestjs/common';

import { TransferInfoController } from './transfer-info.controller';
import { TransferInfoService } from './transfer-info.service';

@Module({
  controllers: [TransferInfoController],
  providers: [TransferInfoService],
})
export class TransferInfoModule {}
