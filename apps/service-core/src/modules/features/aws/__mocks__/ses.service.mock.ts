import { EmailAttachment, SesService as BaseSesService } from '@filesg/aws';

import { MockService } from '../../../../typings/common.mock';
import { SesService } from '../ses.service';

export const mockBaseSesService: MockService<BaseSesService> = {
  sendEmail: jest.fn(),
  sendEmailWithAttachments: jest.fn(),
};

export const mockSesService: MockService<SesService> = {
  sendEmailFromFileSG: jest.fn().mockReturnValue({ MessageId: 'random-message-id-01' }),
};

export const mockEmailReceivers = ['mockReceiver1', 'mockReceiver2'];
export const mockEmailTitle = 'mockEmailTitle';
export const mockEmailContent = 'mockEmailContent';
export const mockAgencyCode = 'mockAgencyCode'

export const mockEmailAttachments: EmailAttachment[] = [
  {
    filename: 'mockFileName1',
    contentType: 'application/zip',
    base64Data: 'mockBase64Data1',
  },
  {
    filename: 'mockFileName2',
    contentType: 'application/zip',
    base64Data: 'mockBase64Data2',
  },
];
