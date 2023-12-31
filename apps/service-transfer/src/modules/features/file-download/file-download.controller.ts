import { ERROR_RESPONSE_DESC } from '@filesg/common';
import { Controller, Get, Logger, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

import { JwtFileDownloadAuthGuard } from '../../../common/guards/jwt-file-download.guard';
import { FileDownloadRequest } from '../../../typings/common';
import { FileDownloadService } from './file-download.service';

@Controller('v1/file-download')
export class FileDownloadController {
  private readonly logger = new Logger(FileDownloadController.name);
  constructor(private readonly fileDownloadService: FileDownloadService) {}

  @Get()
  @UseGuards(JwtFileDownloadAuthGuard)
  @ApiBearerAuth('FileSGBearerTokenDownload')
  @ApiTags('apigw', 'tech-doc:download file')
  @ApiOperation({
    summary: 'file download using JWT',
    description: 'This API enables authorized users to download files from their designated agency folder or from the recipient folder.',
  })
  @ApiOkResponse({
    description: 'The API returns a response stream containing the file data, enabling authorized users to download the file directly.',
  })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.JWT_UNAUTHORISED })
  async download(@Req() req: FileDownloadRequest, @Res() res: Response) {
    const fileSessionId = req.user.fileSessionId;
    const { type, stream, name } = await this.fileDownloadService.downloadFile(fileSessionId);

    await this.pipeStreamToRes(stream, type, res, name);
  }

  @Get('verify')
  @UseGuards(JwtFileDownloadAuthGuard)
  @ApiBearerAuth('File Download Token')
  @ApiOkResponse({ description: 'File has been downloaded' })
  @ApiUnauthorizedResponse({ description: ERROR_RESPONSE_DESC.JWT_UNAUTHORISED })
  async downloadForVerify(@Req() req: FileDownloadRequest, @Res() res: Response) {
    const fileSessionId = req.user.fileSessionId;
    const { type, stream } = await this.fileDownloadService.obfuscateAndDownloadOAFile(fileSessionId);
    await this.pipeStreamToRes(stream, type, res);
  }

  private async pipeStreamToRes(stream: Readable, contentType: string, res: Response, filename?: string) {
    res.set({
      'Content-Disposition': `attachment; filename=${filename ?? ''}`,
      'Content-Type': `${contentType}`,
    });

    /**
     * Pipeline is a node:stream module method to pipe between streams forwarding errors and properly cleaning up and provide a callback when the pipeline is complete.
     * It handles the close / error / end events and destroys the source / destination streams
     * https://github.com/nestjs/nest/pull/9819#issuecomment-1165613527
     *
     * Usage is preferred over stream.pipe(res), which requires manual error handling
     */

    try {
      await pipeline(stream, res);
    } catch (error) {
      this.logger.warn(`Piping stream failed. Error: ${error}`);
    }
  }
}
