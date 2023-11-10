import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditEvent } from '../../../entities/audit-event';
import { AuditEventEntityRepository } from './audit-event.entity.repository';
import { AuditEventEntityService } from './audit-event.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditEvent])],
  providers: [AuditEventEntityService, AuditEventEntityRepository],
  exports: [AuditEventEntityService],
})
export class AuditEventEntityModule {}
