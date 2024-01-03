import { mockReceiveTransferActivity, nonSingpassReceiveRevokeFileAsset } from '../__mocks__/file.transformer.mock';
import { transformViewableFileAsset } from '../file.transformer';

describe('transformViewableFileAsset', () => {
  it('should transform recieve transfer file without error', () => {
    const expectedResult = {
      uuid: nonSingpassReceiveRevokeFileAsset.uuid,
      name: nonSingpassReceiveRevokeFileAsset.name,
      type: nonSingpassReceiveRevokeFileAsset.documentType,
      size: nonSingpassReceiveRevokeFileAsset.size,
      status: nonSingpassReceiveRevokeFileAsset.status,
      expireAt: nonSingpassReceiveRevokeFileAsset.expireAt,
      externalRefId: null,
      createdAt: nonSingpassReceiveRevokeFileAsset.createdAt,
      deleteAt: null,
      isPasswordEncrypted: false,
      isExpired: false,
      isDeleted: false,
      lastViewedAt: nonSingpassReceiveRevokeFileAsset.histories![0].lastViewedAt,
      metadata: nonSingpassReceiveRevokeFileAsset.metadata,
      agencyName: nonSingpassReceiveRevokeFileAsset.issuer?.eservices![0].agency!.name,
      eServiceName: nonSingpassReceiveRevokeFileAsset.issuer?.eservices![0].name,
      agencyCode: nonSingpassReceiveRevokeFileAsset.issuer?.eservices![0].agency!.code,
      ownerName: nonSingpassReceiveRevokeFileAsset.owner?.name,
      isAcknowledgementRequired: true,
      acknowledgedAt: null,
      receiveTransferActivityUuid: mockReceiveTransferActivity.uuid,
      receiveDeleteActivityUuid: null,
    };
    expect(transformViewableFileAsset(nonSingpassReceiveRevokeFileAsset)).toStrictEqual(expectedResult);
  });
  //   it('should transform recieve revoke file without error', () => {
  //     expect(transformViewableFileAsset()).toEqual('asdasdasda');
  //   });
  //   it('should transform recieve expire file without error', () => {
  //     expect(transformViewableFileAsset()).toEqual('asdasdasda');
  //   });
});
