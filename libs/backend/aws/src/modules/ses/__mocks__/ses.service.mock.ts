export const mockSender = 'mockSender';
export const mockEmailTitle = 'mockEmailTitle';
export const mockEmailContent = 'mockEmailContent';

export function mockReceivers(numberOfReceivers = 1) {
  return Array.from(Array(numberOfReceivers)).map((_, index) => `mockReceiver${index + 1}`);
}
