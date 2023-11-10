import { FormSgIssuanceReportRequest } from '@filesg/backend-common';
import { Controller, Get, Logger, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { pipeline } from 'stream/promises';

import { ReportingService } from './reporting.service';

@Controller('v1/report')
export class ReportingController {
  private readonly logger = new Logger(ReportingController.name);

  constructor(private readonly reportService: ReportingService) {}

  @Get('formsg-issuance/:id')
  async generateFormSgIssuanceReport(@Param('id') id: string, @Query() query: FormSgIssuanceReportRequest, @Res() res: Response) {
    const { fileName, mimeType, csvData } = await this.reportService.generateFormSgIssuanceReport(id, query.excludeFailureDetails);

    res.set({
      'Content-Disposition': `attachment; filename=${fileName}`,
      'Content-Type': `${mimeType}`,
    });

    try {
      await pipeline(csvData, res);
    } catch (error) {
      this.logger.warn(`Piping stream failed. Error: ${error}`);
    }
  }
}
