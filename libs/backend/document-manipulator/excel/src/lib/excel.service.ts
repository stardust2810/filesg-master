import { Injectable, Logger } from '@nestjs/common';
import { fromFileAsync, Workbook } from 'xlsx-populate';

import { XlsxLoadFileException } from './excel.common';

/**
 * Only support xlsx format
 * https://github.com/dtjohnson/xlsx-populate/issues/53
 */
@Injectable()
export class ExcelService {
  private readonly logger = new Logger(ExcelService.name);

  public async passwordEncrypt(inputPath: string, outputPath: string, password: string) {
    let workbook: Workbook;
    const taskMessage = `Encrypting excel file from ${inputPath} to ${outputPath}`;

    try {
      this.logger.log(taskMessage);
      workbook = await fromFileAsync(inputPath);
    } catch (error) {
      throw new XlsxLoadFileException(inputPath);
    }

    await workbook.toFileAsync(outputPath, { password });
    this.logger.log(`[Succeed] ${taskMessage}`);
  }
}
