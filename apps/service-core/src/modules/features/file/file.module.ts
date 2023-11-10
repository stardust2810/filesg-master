import { Module } from '@nestjs/common';

import { AgencyEntityModule } from '../../entities/agency/agency.entity.module';
import { AuditEventEntityModule } from '../../entities/audit-event/audit-event.entity.module';
import { EserviceEntityModule } from '../../entities/eservice/eservice.entity.module';
import { FileAssetEntityModule } from '../../entities/file-asset/file-asset.entity.module';
import { FileAssetAccessEntityModule } from '../../entities/file-asset-access/file-asset-access.entity.module';
import { FileAssetHistoryEntityModule } from '../../entities/file-asset-history/file-asset-history.entity.module';
import { UserEntityModule } from '../../entities/user/user.entity.module';
import { FileSGConfigModule } from '../../setups/config/config.module';
import { AuthModule } from '../auth/auth.module';
import { AwsModule } from '../aws/aws.module';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  imports: [
    AwsModule,
    AuditEventEntityModule,
    UserEntityModule,
    AuthModule,
    FileSGConfigModule,
    AgencyEntityModule,
    EserviceEntityModule,
    FileAssetEntityModule,
    FileAssetHistoryEntityModule,
    FileAssetAccessEntityModule,
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
