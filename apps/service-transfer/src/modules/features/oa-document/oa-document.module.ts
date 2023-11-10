import { isValidFileSGDate } from '@filesg/common';
import { Module } from '@nestjs/common';
import Ajv from 'ajv';
import addErrors from 'ajv-errors';
import addFormats from 'ajv-formats';

import { AWSModule } from '../aws/aws.module';
import { OaDocumentService } from './oa-document.service';
import { OaFactory } from './oa-generator.factory';

@Module({
  imports: [AWSModule],
  providers: [
    OaFactory,
    OaDocumentService,
    {
      provide: 'Ajv',
      useFactory: () => {
        const ajv = new Ajv({ allErrors: true });
        addFormats(ajv);
        addErrors(ajv);
        ajv.addKeyword({
          keyword: 'isValidFileSGDate',
          type: 'string',
          validate: (schema: { isValidFileSGDate: boolean }, data: string) => {
            return isValidFileSGDate({ allowEmptyMonthDay: true, allowedDate: 'PAST' })(data);
          },
        });
        return ajv;
      },
    },
  ],
  exports: [OaDocumentService],
})
export class OaDocumentModule {}
