import { FileAssetHistory, FileAssetHistoryCreationModel } from '../../../../entities/file-asset-history';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockFileAssetHistory = (args: TestCreationModel<FileAssetHistoryCreationModel>) => {
  const history = new FileAssetHistory();

  args.id && (history.id = args.id);
  args.uuid && (history.uuid = args.uuid);
  history.type = args.type;
  history.actionBy = args.actionBy;
  history.actionTo = args.actionTo;
  history.fileAsset = args.fileAsset;
  args.fileAssetId && (history.fileAssetId = args.fileAssetId);
  args.actionById && (history.actionById = args.actionById);
  args.actionToId && (history.actionById = args.actionToId);
  args.lastViewedAt && (history.lastViewedAt = args.lastViewedAt);

  return history;
};
