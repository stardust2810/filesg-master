import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcknowledgementTemplate } from '../../../entities/acknowledgement-template';
import { AcknowledgementTemplateEntityRepository } from './acknowledgement-template.entity.repository';
import { AcknowledgementTemplateEntityService } from './acknowledgement-template.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([AcknowledgementTemplate])],
  providers: [AcknowledgementTemplateEntityService, AcknowledgementTemplateEntityRepository],
  exports: [AcknowledgementTemplateEntityService],
})
export class AcknowledgementTemplateEntityModule {}
