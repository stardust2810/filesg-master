import { Injectable, Logger } from '@nestjs/common';

import { FileAsset } from '../../../entities/file-asset';
import { FileAssetEntityService } from '../../entities/file-asset/file-asset.entity.service';
import { DeletionService } from '../deletion/deletion.service';

@Injectable()
export class AgencyDeleteDocumentsService {
  private logger = new Logger(AgencyDeleteDocumentsService.name);

  constructor(private readonly deletionService: DeletionService, private readonly fileAssetEntityService: FileAssetEntityService) {}

  public async agencyDeleteDocuments() {
    let fileAssets: FileAsset[];
    const PROCESS_CHUNK_SIZE = 20; // total files processed will be chunk size times  1 + no of recipients for that transaction
    let totalFilesProcessed = 0;

    do {
      fileAssets = await this.fileAssetEntityService.retrieveFileAssetsByStatusesAndDeleteAt(PROCESS_CHUNK_SIZE);

      // if no fileAssets to delete, end cronjob
      if (fileAssets.length === 0) {
        if (totalFilesProcessed) {
          this.logger.log(`Processed a total of ${totalFilesProcessed} files. Completed processing of all files.`);
        } else {
          this.logger.log('There are no files to be processed.');
        }
        return;
      }

      this.logger.log(`Processing total of ${fileAssets.length} in current batch`);
      // NOTE: File deletion will trigger revocation. To remove if file deletion no longer revokes OA
      await this.deletionService.agencyDeleteFileAssets(fileAssets);
      totalFilesProcessed += fileAssets.length;
    } while (fileAssets.length > 0);
  }
}
