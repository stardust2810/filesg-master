import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Corporate } from '../../../entities/corporate';
import { CorporateUser } from '../../../entities/corporate-user';
import { AgencyUser, CitizenUser, EserviceUser, ProgrammaticUser, User } from '../../../entities/user';
import { AgencyUserEntityRepository } from './agency-user.entity.repository';
import { AgencyUserEntityService } from './agency-user.entity.service';
import { CitizenUserEntityRepository } from './citizen-user.entity.repository';
import { CitizenUserEntityService } from './citizen-user.entity.service';
import { CorporateEntityRepository } from './corporate/corporate.entity.repository';
import { CorporateEntityService } from './corporate/corporate.entity.service';
import { CorporateUserEntityRepository } from './corporate-user/corporate-user.entity.repository';
import { CorporateUserEntityService } from './corporate-user/corporate-user.entity.service';
import { EserviceUserEntityRepository } from './eservice-user.entity.repository';
import { EserviceUserEntityService } from './eservice-user.entity.service';
import { ProgrammaticUserEntityRepository } from './programmatic-user.entity.repository';
import { ProgrammaticUserEntityService } from './programmatic-user.entity.service';
import { UserEntityRepository } from './user.entity.repository';
import { UserEntityService } from './user.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, AgencyUser, CitizenUser, ProgrammaticUser, EserviceUser, Corporate, CorporateUser])],
  providers: [
    UserEntityService,
    AgencyUserEntityService,
    CitizenUserEntityService,
    ProgrammaticUserEntityService,
    EserviceUserEntityService,
    CorporateEntityService,
    CorporateUserEntityService,
    UserEntityRepository,
    AgencyUserEntityRepository,
    CitizenUserEntityRepository,
    ProgrammaticUserEntityRepository,
    EserviceUserEntityRepository,
    CorporateEntityRepository,
    CorporateUserEntityRepository,
  ],
  exports: [
    UserEntityService,
    AgencyUserEntityService,
    CitizenUserEntityService,
    ProgrammaticUserEntityService,
    EserviceUserEntityService,
    CorporateEntityService,
    CorporateUserEntityService,
  ],
})
export class UserEntityModule {}
