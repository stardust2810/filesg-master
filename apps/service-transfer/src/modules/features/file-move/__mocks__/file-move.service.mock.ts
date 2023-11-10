import { FILE_SESSION_TYPE, FileMoveInfoResponse, TRANSACTION_TYPE } from '@filesg/common';

import { FileMoveService, MessageInfo } from '../file-move.service';

export class TestFileMoveService extends FileMoveService {
  public async pollHandler() {
    return super.pollHandler();
  }

  public async onMessageHandler(msg: MessageInfo) {
    return super.onMessageHandler(msg);
  }

  public async retrieveSessionInfo(fileSessionId: string) {
    return super.retrieveSessionInfo(fileSessionId);
  }
}

export const mockTransferMoveTransferInfo: FileMoveInfoResponse = {
  fileSession: {
    id: 'fileSession-uuid-1',
    type: FILE_SESSION_TYPE.TRANSFER,
  },
  transaction: {
    id: 'transaction-uuid-1',
    type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  },
  fromBucket: 's3-fsg-devezapp-file-main',
  toBucket: 's3-fsg-devezapp-file-main',
  transfers: [
    {
      activityId: 'activity-uuid-1',
      assumeRole: {
        owner: '54321979629566c84f025dae60fd3e19ad484b56d1f50d869db692783d912345',
        receiver: '106e6979629566c84f025dae60fd3e19ad484b56d1f50d869db692783d9bea17',
      },
      files: [
        {
          from: {
            fileAssetUuid: 'fileAsset-uuid-1',
            key: '54321979629566c84f025dae60fd3e19ad484b56d1f50d869db692783d912345/fileAsset-uuid-1',
          },
          to: {
            fileAssetUuid: 'fileAsset-uuid-3',
            key: '106e6979629566c84f025dae60fd3e19ad484b56d1f50d869db692783d9bea17/fileAsset-uuid-3',
          },
        },
        {
          from: {
            fileAssetUuid: 'fileAsset-uuid-2',
            key: '54321979629566c84f025dae60fd3e19ad484b56d1f50d869db692783d912345/fileAsset-uuid-2',
          },
          to: {
            fileAssetUuid: 'fileAsset-uuid-4',
            key: '106e6979629566c84f025dae60fd3e19ad484b56d1f50d869db692783d9bea17/fileAsset-uuid-4',
          },
        },
      ],
    },
  ],
};
