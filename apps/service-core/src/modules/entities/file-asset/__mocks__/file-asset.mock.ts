import { FileAsset, FileAssetCreationModel } from '../../../../entities/file-asset';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockFileAsset = (args: TestCreationModel<FileAssetCreationModel>) => {
  const fileAsset = new FileAsset();

  args.id && (fileAsset.id = args.id);
  args.uuid && (fileAsset.uuid = args.uuid);
  args.oaCertificate && (fileAsset.oaCertificate = args.oaCertificate);
  args.oaCertificateId && (fileAsset.oaCertificateId = args.oaCertificateId);
  args.ownerId && (fileAsset.ownerId = args.ownerId);
  args.issuerId && (fileAsset.issuerId = args.issuerId);
  fileAsset.name = args.name;
  args.documentHash && (fileAsset.documentHash = args.documentHash);
  args.documentType && (fileAsset.documentType = args.documentType);
  fileAsset.type = args.type;
  fileAsset.size = args.size;
  fileAsset.status = args.status;
  args.failCategory && (fileAsset.failCategory = args.failCategory);
  args.failReason && (fileAsset.failReason = args.failReason);
  args.metadata && (fileAsset.metadata = args.metadata);
  fileAsset.expireAt = args.expireAt ?? null;
  fileAsset.deleteAt = args.deleteAt ?? null;
  fileAsset.isPasswordEncrypted = args.isPasswordEncrypted ?? false;
  fileAsset.children = args.children;
  fileAsset.parent = args.parent;
  fileAsset.owner = args.owner;
  fileAsset.issuer = args.issuer;
  fileAsset.activities = args.activities;
  fileAsset.histories = args.histories;

  return fileAsset;
};
