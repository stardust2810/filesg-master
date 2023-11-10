import { Module } from '@nestjs/common';

import { ApiClientModule } from '../../setups/api-client/api-client.module';
import { AWSModule } from '../aws/aws.module';
import { FileMoveService } from './file-move.service';
import { DeleteService } from './move-type/delete.service';
import { UploadAndTransferMoveService } from './move-type/upload-transfer-move.service';

@Module({
  imports: [AWSModule, ApiClientModule],
  providers: [FileMoveService, UploadAndTransferMoveService, DeleteService],
})
export class FileMoveModule {}
