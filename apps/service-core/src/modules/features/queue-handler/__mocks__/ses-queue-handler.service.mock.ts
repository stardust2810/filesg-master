import { Message } from '@aws-sdk/client-sqs';
import { SES_NOTIFICATION_TYPE, SESEmailNotificationMessage } from '@filesg/aws';
import { ACTIVITY_STATUS, ACTIVITY_TYPE, NOTIFICATION_CHANNEL, NOTIFICATION_STATUS } from '@filesg/common';

import { EMAIL_TYPES } from '../../../../utils/email-template';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { createMockEmail } from '../../../entities/email/__mocks__/email.mock';
import { createMockNotificationHistory } from '../../../entities/notification-history/__mocks__/notification-history.mock';
import { SesNotificationQueueHandlerService } from '../ses-notification-queue-handler.service';

const MOCK_BOUNCE_EMAIL = 'bounce@simulator.amazonses.com';

// =============================================================================
// Test Service
// =============================================================================
export class TestSesNotificationQueueHandlerService extends SesNotificationQueueHandlerService {
  public async pollHandler() {
    return super.pollHandler();
  }

  public async onMessageHandler(msg: Message) {
    return super.onMessageHandler(msg);
  }
}

// =============================================================================
// Mock Entities
// =============================================================================
export const mockEmail = createMockEmail({
  id: 1,
  awsMessageId: 'aws-message-id-1',
  type: EMAIL_TYPES.ISSUANCE,
  emailId: MOCK_BOUNCE_EMAIL,
});

const mockActivity = createMockActivity({
  uuid: `mock-activity-01`,
  status: ACTIVITY_STATUS.COMPLETED,
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
});

export const mockBounceEmailNotificationHistory = createMockNotificationHistory({
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
  status: NOTIFICATION_STATUS.SUCCESS,
  messageId: 'mock-message-id-01',
  activity: mockActivity,
});

// =============================================================================
// Mock Message
// =============================================================================

export const mockIssuanceEmailNotificationMessageBounce: SESEmailNotificationMessage = {
  notificationType: SES_NOTIFICATION_TYPE.BOUNCE,
  mail: {
    timestamp: new Date().toISOString(),
    messageId: 'mock-message-id-01',
    source: 'source@email.com',
    sourceArn: 'source@email.com',
    sourceIp: '127.0.0.1',
    sendingAccountId: 'mock-sending-account-id-01',
    destination: [MOCK_BOUNCE_EMAIL],
  },
  bounce: {
    bounceType: 'Permanent',
    bounceSubType: 'NoEmail',
    bouncedRecipients: [{ emailAddress: MOCK_BOUNCE_EMAIL }],
    timestamp: new Date().toISOString(),
    feedbackId: `mock-feedback-id-01`,
  },
};

export const mockSesMessageWithBounceInfo = {
  MessageId: 'message-1',
  Attributes: { ApproximateReceiveCount: '1' },
  Body: JSON.stringify({ Message: JSON.stringify(mockIssuanceEmailNotificationMessageBounce) }),
};
