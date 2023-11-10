import { escapeString, execShellCmd } from '@filesg/backend-common';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { PdfEncryptionException } from './pdf.common';
import { PDF_MODULE_OPTIONS, PdfConfig } from './pdf.typings';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(@Inject(PDF_MODULE_OPTIONS) private readonly config: PdfConfig) {}

  public async passwordEncrypt(inputPath: string, outputPath: string, password: string) {
    const taskMessage = `Encrypting pdf file from ${inputPath} to ${outputPath}`;

    try {
      this.logger.log(taskMessage);
      await execShellCmd(
        `java -jar ${this.config.jarFilePath} Encrypt -U "${password}" ${escapeString(inputPath)} ${escapeString(outputPath)}`,
      );
      this.logger.log(`[Succeed] ${taskMessage}`);
    } catch (error) {
      throw new PdfEncryptionException(error, inputPath);
    }
  }
}
