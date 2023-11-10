import { Module } from '@nestjs/common';

import { AuditEventEntityModule } from '../../entities/audit-event/audit-event.entity.module';
import { FileAssetEntityModule } from '../../entities/file-asset/file-asset.entity.module';
import { DatabaseTransactionModule } from '../../setups/database/db-transaction.module';
import { AuditEventController } from './audit-event.controller';
import { AuditEventService } from './audit-event.service';

@Module({
  providers: [AuditEventService],
  exports: [AuditEventService],
  imports: [AuditEventEntityModule, FileAssetEntityModule, DatabaseTransactionModule],
  controllers: [AuditEventController],
})
export class AuditEventModule {}
