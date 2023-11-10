import { Module } from '@nestjs/common';

import { FileAssetEntityModule } from '../../entities/file-asset/file-asset.entity.module';
import { UserEntityModule } from '../../entities/user/user.entity.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [UserEntityModule, FileAssetEntityModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
