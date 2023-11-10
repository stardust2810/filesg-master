import { NOTIFICATION_CHANNEL } from '@filesg/common';
import { UnzipService } from '@filesg/zipper';
import { plainToClass } from 'class-transformer';

import {
  SidecarAgencyPasswordRecord,
  SidecarData,
  SidecarFileRecord,
  SidecarNotificationsRecord,
  SidecarRecipientRecord,
  SidecarTransactionRecord,
} from '../../../../common/dtos/sidecar-data';
import { MockService } from '../../../../typings/common.mock';
import { SidecarFileService } from '../sidecar-file.service';

type Serialize<T> = {
  [P in keyof T]: string;
};

export const mockDir = 'mockDir';

export const mockSidecarTransactionRecord: Serialize<SidecarTransactionRecord>[] = [
  {
    applicationType: 'mockApplicationType',
    applicationExternalRefId: 'mockApplicationExternalRefId',
    transactionName: 'mockTransactionName',
    transactionType: 'upload_transfer',
    transactionMessageId: 'transactioncustommessagetemplate-1655625225500-9c72b9eac3dc42f6',
    isAcknowledgementRequired: 'TRUE',
    acknowledgementTemplateId: 'mockAcknowledgementTemplateId',
    clientId: 'mockClientId',
    clientSecret: 'mockClienSecret',
  },
];

export const mockSidecarRecipientRecords: Serialize<SidecarRecipientRecord>[] = [
  {
    uin: 'S1000000I',
    fullName: 'Mock Full Name 1',
    email: 'test1@dummy.com',
    dob: '1999-01-01',
    contact: '+6598765432',
    metadata: '{"hello": "world"}',
  },
  {
    uin: 'S1000001G',
    fullName: 'Mock Full Name 2',
    email: 'test2@dummy.com',
    dob: '1999-00-00',
    contact: '+6598111111',
  },
];

export const mockSidecarFileRecords: Serialize<SidecarFileRecord>[] = [
  {
    name: 'mockFileName1.pdf',
    checksum: 'd2e5099b3cda2727f5f4df356ee3061b695113a311f11117de8c11713aa901b4',
    expiry: '2024-12-01',
    metadata: '{"hello": "world"}',
    deleteAt: '2024-12-31',
    isPasswordEncryptionRequired: 'TRUE',
  },
  {
    name: 'mockFileName2.pdf',
    checksum: 'd2e5099b3cda2727f5f4df356ee3061b695113a311f11117de8c11713aa901b4',
    expiry: '2024-12-01',
    deleteAt: '2024-12-31',
    isPasswordEncryptionRequired: 'TRUE',
  },
];

export const mockSidecareNotificationsRecords: SidecarNotificationsRecord[] = [
  {
    channel: NOTIFICATION_CHANNEL.EMAIL,
    templateId: 'transactioncustommessagetemplate-1655625225500-9c72b9eac3dc42f6',
    templateInput: { hello: 'world' },
  },
];

const mockSidecarAgencyPassword: Serialize<SidecarAgencyPasswordRecord>[] = [];

export const mockSidecarData = plainToClass(SidecarData, {
  transactions: mockSidecarTransactionRecord,
  files: mockSidecarFileRecords,
  recipients: mockSidecarRecipientRecords,
  agencyPassword: mockSidecarAgencyPassword,
});

export const mockSidecarFileService: MockService<SidecarFileService> = {
  checkSidecarFilesExistsOrThrow: jest.fn(),
  parseSidecarFiles: jest.fn(),
};

export const mockUnzipService: MockService<UnzipService> = {
  unzipToZipStream: jest.fn(),
  unzipToDisk: jest.fn(),
};
