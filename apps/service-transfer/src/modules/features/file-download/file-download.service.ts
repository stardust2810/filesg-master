import { Readable } from 'node:stream';

import { AgencyFilesDownloadMessage, DownloadInfoErrorException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, EVENT, FileDownloadResponse } from '@filesg/common';
import { ZippingFile, ZipService } from '@filesg/zipper';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosInstance } from 'axios';

import { FileDownloadErrorException } from '../../../common/filters/custom-exceptions.filter';
import { MGMT_SERVICE_API_CLIENT_PROVIDER, OA_AGENCY_DATA_KEY, OA_OBFUSCATION_KEYS } from '../../../typings/common';
import { S3Service } from '../aws/s3.service';
import { SqsService } from '../aws/sqs.service';
import { StsService } from '../aws/sts.service';
import { OaDocumentService } from '../oa-document/oa-document.service';

@Injectable()
export class FileDownloadService {
  private readonly logger = new Logger(FileDownloadService.name);
  constructor(
    private readonly s3Service: S3Service,
    private readonly stsService: StsService,
    private readonly sqsService: SqsService,
    private readonly zipService: ZipService,
    private readonly oaDocumentService: OaDocumentService,
    @Inject(MGMT_SERVICE_API_CLIENT_PROVIDER) private readonly mgmtServiceApiClient: AxiosInstance,
  ) {}

  public async obfuscateAndDownloadOAFile(fileSessionId: string) {
    const { type, stream, fileAssetIds, name } = await this.downloadFile(fileSessionId);

    // convert stream to data in memory to perform obfuscation
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const downloadedOA = Buffer.concat(chunks).toString('utf-8');
    const obfuscatedOADocument = this.oaDocumentService.obfuscateOa(
      JSON.parse(downloadedOA),
      OA_OBFUSCATION_KEYS.map((obfuscateKey: string) => `${OA_AGENCY_DATA_KEY}.${obfuscateKey}`),
    );

    // convert back to stream
    const downloadedOAStream = new Readable();
    downloadedOAStream.push(JSON.stringify(obfuscatedOADocument));
    downloadedOAStream.push(null);

    return { type, fileAssetIds, stream: downloadedOAStream as Readable, name };
  }

  public async downloadFile(fileSessionId: string) {
    const taskMessage = `Downloading file(s)`;
    this.logger.log(taskMessage);
    try {
      this.logger.log(`Retrieving download info from Management Serivce, file session: ${fileSessionId}`);

      const { ownerUuidHash, files, isAgencyDownload, ownerUuid } = await this.retrieveDownloadInfo(fileSessionId);
      const fileAssetIds = files.map((file) => file.id);
      this.logger.log(`Retrieved files: ${fileAssetIds.join(',')}`);

      const creds = await this.stsService.assumeRetrieveRole(ownerUuidHash);
      const s3Client = await this.s3Service.createAssumedClient(creds);

      // If only 1 file, stream back
      if (files.length === 1) {
        const file = files[0];
        const { Body, ContentType } = await this.s3Service.downloadFileFromMainBucket(`${ownerUuidHash}/${file.id}`, file.name, s3Client);

        if (!Body || !ContentType) {
          throw new Error(`File data missing`);
        }

        if (isAgencyDownload) {
          this.sendAgencyDownloadEventMessageToQueueCoreEvents(fileAssetIds, ownerUuid);
        }

        return { type: ContentType!, stream: Body as Readable, fileAssetIds, name: files[0].name };
      }

      // filenameMap to check if filename already exist. Adds numbering to duplicate
      const filenameMap: Record<string, number> = {};

      const promiseArray = files.map(async (file) => {
        const { id, name } = file;
        const { Body } = await this.s3Service.downloadFileFromMainBucket(`${ownerUuidHash}/${id}`, name, s3Client);

        let streamFilename: string;

        if (!filenameMap[name]) {
          streamFilename = name;
          filenameMap[name] = 1;
        } else {
          const extensionPeriodIndex = name.lastIndexOf('.') === -1 ? name.length : name.lastIndexOf('.');
          const filenameWithoutExtension = name.slice(0, extensionPeriodIndex);
          const extension = name.slice(extensionPeriodIndex);

          streamFilename = `${filenameWithoutExtension} (${filenameMap[name]})${extension}`;
          filenameMap[name]++;
        }

        const streamFile: ZippingFile = {
          name: streamFilename,
          body: Body as Readable,
        };

        return streamFile;
      });

      const zippingFiles = await Promise.all(promiseArray);
      const zip = await this.zipService.zipToStream(zippingFiles);

      if (isAgencyDownload) {
        this.sendAgencyDownloadEventMessageToQueueCoreEvents(fileAssetIds, ownerUuid);
      }

      return { type: 'application/zip', stream: zip, fileAssetIds, name: 'filedownload-archive.zip' };
    } catch (error) {
      const internalLog = `[Failed] ${taskMessage}, Error: ${JSON.stringify(error)}`;
      throw new FileDownloadErrorException(COMPONENT_ERROR_CODE.FILE_DOWNLOAD, internalLog);
    }
  }

  private async retrieveDownloadInfo(fileSessionId: string) {
    const taskMessage = `Retrieving download info of ${fileSessionId} from management service`;

    try {
      this.logger.log(taskMessage);

      const response = await this.mgmtServiceApiClient.get<FileDownloadResponse>(`v1/file-download/${fileSessionId}`);

      this.logger.log(`[Succeed] Retrieved download info: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      const internalLog = `[Failed] ${taskMessage}. Error: ${JSON.stringify(error)}`;
      throw new DownloadInfoErrorException(COMPONENT_ERROR_CODE.FILE_DOWNLOAD, fileSessionId, internalLog);
    }
  }

  public async sendAgencyDownloadEventMessageToQueueCoreEvents(fileAssetIds: string[], ownerUuid: string) {
    try {
      const message: AgencyFilesDownloadMessage = {
        event: EVENT.AGENCY_DOWNLOADED_FILES,
        payload: {
          fileAssetIds,
          userUuid: ownerUuid,
        },
      };

      await this.sqsService.sendMessageToQueueCoreEvents(message);
    } catch (error) {
      this.logger.error(`Failed to send agency file download event to core, ${JSON.stringify(error)}`);
    }
  }
}
