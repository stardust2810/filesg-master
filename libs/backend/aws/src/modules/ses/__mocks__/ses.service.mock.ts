import { EmailAttachment } from '../../../typings/ses.typing';

export const mockSender = 'mockSender';
export const mockEmailTitle = 'mockEmailTitle';
export const mockEmailContent = 'mockEmailContent';

export function mockReceivers(numberOfReceivers = 1) {
  return Array.from(Array(numberOfReceivers)).map((_, index) => `mockReceiver${index + 1}`);
}

export const mockEmailAttachments: EmailAttachment[] = [
  {
    filename: 'mockFilename1',
    contentType: 'mockContentType1',
    base64Data: 'mockBase64Data1',
  },
  {
    filename: 'mockFilename2',
    contentType: 'mockContentType2',
    base64Data: 'mockBase64Data2',
  },
];
