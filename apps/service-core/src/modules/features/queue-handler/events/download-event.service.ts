import { DownloadMessage } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, FILE_ASSET_ACTION } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { DatabaseException } from '../../../../common/filters/custom-exceptions.filter';
import { FileAssetHistory } from '../../../../entities/file-asset-history';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import { FileAssetHistoryEntityService } from '../../../entities/file-asset-history/file-asset-history.entity.service';
import { DatabaseTransactionService } from '../../../setups/database/db-transaction.service';

@Injectable()
export class DownloadEventService {
  private logger = new Logger(DownloadEventService.name);

  constructor(
    private readonly fileAssetEntityService: FileAssetEntityService,
    private readonly fileAssetHistoryEntityService: FileAssetHistoryEntityService,
    private readonly databaseTransactionService: DatabaseTransactionService,
  ) {}

  // ===========================================================================
  // Main Handlers
  // ===========================================================================
  public async fileDownloadedHandler(messageBody: DownloadMessage) {
    const taskMessage = 'Processing file(s) downloaded event';
    this.logger.log(taskMessage);

    const txn = await this.databaseTransactionService.startTransaction();
    const { entityManager } = txn;

    try {
      const { fileAssetIds } = messageBody.payload;
      this.logger.log(`Creating download file asset history for file(s): ${fileAssetIds.join(', ')}`);

      const promiseArray = fileAssetIds.map((fileAssetId) => this.retrieveFileAssetAndCreateDownloadHistory(fileAssetId, entityManager));
      await Promise.all(promiseArray);

      await txn.commit();
      this.logger.log(`[Success] ${taskMessage}`);
    } catch (error) {
      await txn.rollback();
      throw new Error(`[Failed] ${taskMessage}, error: ${error}`);
    }
  }

  protected async retrieveFileAssetAndCreateDownloadHistory(fileAssetId: string, entityManager: EntityManager) {
    // Retrieve file Asset
    try {
      this.logger.log(`Retrieving fileAsset: ${fileAssetId}`);
      const fileAsset = await this.fileAssetEntityService.retrieveFileAssetByUuid(fileAssetId, entityManager);

      // Create fileAssetHistory
      this.logger.log(`Creating download fileAssetHistory for fileAsset: ${fileAssetId}`);
      await this.fileAssetHistoryEntityService.saveFileAssetHistory({ type: FILE_ASSET_ACTION.DOWNLOAD, fileAsset }, entityManager);
    } catch (error) {
      throw new DatabaseException(COMPONENT_ERROR_CODE.DOWNLOAD_EVENT_SERVICE, 'creating', FileAssetHistory.name);
    }
  }
}
