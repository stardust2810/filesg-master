import { Module } from '@nestjs/common';

import { AgencyEntityModule } from '../../entities/agency/agency.entity.module';
import { FileAssetEntityModule } from '../../entities/file-asset/file-asset.entity.module';
import { UserEntityModule } from '../../entities/user/user.entity.module';
import { CorppassUserService } from './user..corppass.service';
import { UserController } from './user.controller';
import { CorppassUserController } from './user.corppass.controller';
import { UserService } from './user.service';

@Module({
  imports: [UserEntityModule, FileAssetEntityModule, AgencyEntityModule],
  controllers: [UserController, CorppassUserController],
  providers: [UserService, CorppassUserService],
  exports: [UserService, CorppassUserService],
})
export class UserModule {}
