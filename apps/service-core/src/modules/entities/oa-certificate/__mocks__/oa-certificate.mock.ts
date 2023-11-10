import { OACertificate, OaCertificateCreationModel } from '../../../../entities/oa-certificate';
import { TestCreationModel } from '../../../../typings/common.mock';

export function createMockOaCertificate(args: TestCreationModel<OaCertificateCreationModel, string>) {
  const oaCertificate = new OACertificate();

  oaCertificate.id = args.id;
  args.status && (oaCertificate.status = args.status);
  args.revocationType && (oaCertificate.revocationType = args.revocationType);
  args.reason && (oaCertificate.reason = args.reason);
  args.revokedBy && (oaCertificate.revokedBy = args.revokedBy);
  args.fileAssets && (oaCertificate.fileAssets = args.fileAssets);
  oaCertificate.hash = args.hash;

  return oaCertificate;
}
