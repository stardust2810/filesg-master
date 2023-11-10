import { Module } from '@nestjs/common';

import { FormSgService } from './formsg.service';

@Module({
  providers: [FormSgService],
  exports: [FormSgService],
})
export class FormSgModule {}
