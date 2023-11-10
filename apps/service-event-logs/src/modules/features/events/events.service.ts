import { EVENT_LOGGING_EVENTS, EventLoggingRequest } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';

import { EventsHandlingException } from '../../../common/filters/custom-exceptions.filter';
import { FormSgTransactionService } from '../formsg-transaction/formsg-transaction.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly formSgTransactionService: FormSgTransactionService) {}

  public async handleEvents(body: EventLoggingRequest) {
    const { event } = body;

    try {
      switch (event.type) {
        case EVENT_LOGGING_EVENTS.FORMSG_PROCESS_INIT: {
          await this.formSgTransactionService.handleProcessInit(event);
          break;
        }

        case EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_UPDATE: {
          await this.formSgTransactionService.handleProcessUpdate(event);
          break;
        }

        case EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_COMPLETE: {
          await this.formSgTransactionService.handleBatchProcessComplete(event);
          break;
        }

        case EVENT_LOGGING_EVENTS.FORMSG_PROCESS_SUCCESS:
        case EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_TRANSACTION_SUCCESS: {
          await this.formSgTransactionService.handleProcessSuccess(event);
          break;
        }

        case EVENT_LOGGING_EVENTS.FORMSG_PROCESS_FAILURE:
        case EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_TRANSACTION_FAILURE:
        case EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_FAILURE: {
          await this.formSgTransactionService.handleProcessFailure(event);
          break;
        }

        case EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_SUCCESS: {
          await this.formSgTransactionService.handleTransactionSuccess(event);
          break;
        }

        case EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_FAILURE: {
          await this.formSgTransactionService.handleTransactionFailure(event);
          break;
        }

        case EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS:
        case EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE: {
          await this.formSgTransactionService.handleRecipientNotificationDelivery(event);
          break;
        }

        default: {
          this.logger.error(`Unknown event type: ${(event as any).type}`);
          break;
        }
      }
    } catch (error) {
      throw new EventsHandlingException(COMPONENT_ERROR_CODE.EVENTS_SERVICE, (error as Error).message);
    }
  }
}
