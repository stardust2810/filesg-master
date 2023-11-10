import { Message } from '@aws-sdk/client-sqs';

import { CoreEventsQueueHandlerService } from '../core-events-queue-handler.service';

// =============================================================================
// Test Service
// =============================================================================
export class TestCoreEventsQueueHandlerService extends CoreEventsQueueHandlerService {
  public async pollHandler() {
    return super.pollHandler();
  }

  public async onMessageHandler(msg: Message) {
    return super.onMessageHandler(msg);
  }
}
