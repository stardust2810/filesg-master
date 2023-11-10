import { FileAssetAccess, FileAssetAccessCreationModel } from '../../../../entities/file-asset-access';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockFileAssetAccess = (args: TestCreationModel<FileAssetAccessCreationModel>) => {
  const fileAssetAccess = new FileAssetAccess();
  args.token && (fileAssetAccess.token = args.token);
  args.fileAsset && (fileAssetAccess.fileAsset = args.fileAsset);

  return fileAssetAccess;
};
