import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EserviceWhitelistedUser } from '../../../entities/eservice-whitelisted-user';
import { EserviceWhitelistedUserEntityRepository } from './eservice-whitelisted-user.entity.respository';
import { EserviceWhitelistedUserEntityService } from './eservice-whitelisted-user.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([EserviceWhitelistedUser])],
  providers: [EserviceWhitelistedUserEntityService, EserviceWhitelistedUserEntityRepository],
  exports: [EserviceWhitelistedUserEntityService],
})
export class EserviceWhitelistedUserEntityModule {}
