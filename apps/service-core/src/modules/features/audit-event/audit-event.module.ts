import { Module } from '@nestjs/common';

import { AuditEventEntityModule } from '../../entities/audit-event/audit-event.entity.module';
import { FileAssetEntityModule } from '../../entities/file-asset/file-asset.entity.module';
import { DatabaseTransactionModule } from '../../setups/database/db-transaction.module';
import { AuditEventController } from './audit-event.controller';
import { CorppassAuditEventController } from './audit-event.corppass.controller';
import { AuditEventService } from './audit-event.service';
import { AuditFileAssetStrategyFactory } from './factory/audit-file-asset-retrieval.factory';
import { AuditFileStrategies } from './strategy';

@Module({
  providers: [AuditEventService, AuditFileAssetStrategyFactory, ...AuditFileStrategies],
  exports: [AuditEventService],
  imports: [AuditEventEntityModule, FileAssetEntityModule, DatabaseTransactionModule],
  controllers: [AuditEventController, CorppassAuditEventController],
})
export class AuditEventModule {}
