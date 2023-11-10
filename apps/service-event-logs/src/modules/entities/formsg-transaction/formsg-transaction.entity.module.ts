import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';

import { FORMSG_TRANSACTION, FormSgTransactionSchema } from '../../../entities/formsg-transaction';
import { FileSGConfigService } from '../../setups/config/config.service';
import { FormSgTransactionEntityService } from './formsg-transaction.entity.service';

@Module({
  imports: [
    DynamooseModule.forFeatureAsync([
      {
        name: FORMSG_TRANSACTION,
        inject: [FileSGConfigService],
        useFactory: (_, configService: FileSGConfigService) => {
          const {
            awsConfig: { formSgTransactionEventLogsTableName },
          } = configService;

          return {
            schema: FormSgTransactionSchema,
            options: { tableName: formSgTransactionEventLogsTableName },
          };
        },
      },
    ]),
  ],
  providers: [FormSgTransactionEntityService],
  exports: [FormSgTransactionEntityService],
})
export class FormSgTransactionEntityModule {}
