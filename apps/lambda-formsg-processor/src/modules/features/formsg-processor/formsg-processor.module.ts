import { FormSgModule } from '@filesg/formsg';
import { ZipperModule } from '@filesg/zipper';
import { Module } from '@nestjs/common';

import { ApiClientModule } from '../../setups/api-client/api-client.module';
import { AwsModule } from '../aws/aws.module';
import { BatchIssuanceFormService } from './form-handler/batch-issuance-form.service';
import { RecallTransactionFormService } from './form-handler/recall-transaction-form.service';
import { SingleIssuanceFormService } from './form-handler/single-issuance-form.service';
import { FormSgProcessorService } from './formsg-processor.service';

@Module({
  providers: [FormSgProcessorService, SingleIssuanceFormService, BatchIssuanceFormService, RecallTransactionFormService],
  imports: [ApiClientModule, FormSgModule, ZipperModule, AwsModule],
})
export class FormsgProcessorModule {}
