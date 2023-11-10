/* eslint-disable sonarjs/no-duplicate-string */
import { EventLoggingRequest } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EventsHandlingException } from '../../../../common/filters/custom-exceptions.filter';
import { mockFormSgTransactionService } from '../../formsg-transaction/__mocks__/formsg-transaction.service.mock';
import { FormSgTransactionService } from '../../formsg-transaction/formsg-transaction.service';
import {
  formSgProcessFailureEvent,
  formSgProcessInitEvent,
  formSgProcessSuccessEvent,
  formSgRecipientNotificationDeliveryFailureEvent,
  formSgRecipientNotificationDeliverySuccessEvent,
  formSgTransactionFailureEvent,
  formSgTransactionSuccessEvent,
} from '../__mocks__/events.service.mock';
import { EventsService } from '../events.service';

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsService, { provide: FormSgTransactionService, useValue: mockFormSgTransactionService }],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleEvents', () => {
    it('should call handleProcessInit when the event is of type formsg-process-init', async () => {
      const body: EventLoggingRequest = { event: formSgProcessInitEvent };

      await service.handleEvents(body);
      expect(mockFormSgTransactionService.handleProcessInit).toBeCalledWith(formSgProcessInitEvent);
    });

    it('should call handleProcessSuccess when the event is of type formsg-process-success', async () => {
      const body: EventLoggingRequest = { event: formSgProcessSuccessEvent };

      await service.handleEvents(body);
      expect(mockFormSgTransactionService.handleProcessSuccess).toBeCalledWith(formSgProcessSuccessEvent);
    });

    it('should call handleProcessFailure when the event is of type formsg-process-failure', async () => {
      const body: EventLoggingRequest = { event: formSgProcessFailureEvent };

      await service.handleEvents(body);
      expect(mockFormSgTransactionService.handleProcessFailure).toBeCalledWith(formSgProcessFailureEvent);
    });

    it('should call handleTransactionSuccess when the event is of type formsg-transaction-success', async () => {
      const body: EventLoggingRequest = { event: formSgTransactionSuccessEvent };

      await service.handleEvents(body);
      expect(mockFormSgTransactionService.handleTransactionSuccess).toBeCalledWith(formSgTransactionSuccessEvent);
    });

    it('should call handleTransactionFailure when the event is of type formsg-transaction-failure', async () => {
      const body: EventLoggingRequest = { event: formSgTransactionFailureEvent };

      await service.handleEvents(body);
      expect(mockFormSgTransactionService.handleTransactionFailure).toBeCalledWith(formSgTransactionFailureEvent);
    });

    it('should call handleRecipientNotificationDelivery when the event is of type formsg-recipient-notification-delivery-success', async () => {
      const body: EventLoggingRequest = { event: formSgRecipientNotificationDeliverySuccessEvent };

      await service.handleEvents(body);
      expect(mockFormSgTransactionService.handleRecipientNotificationDelivery).toBeCalledWith(
        formSgRecipientNotificationDeliverySuccessEvent,
      );
    });

    it('should call handleRecipientNotificationDelivery when the event is of type formsg-recipient-notification-delivery-failure', async () => {
      const body: EventLoggingRequest = { event: formSgRecipientNotificationDeliveryFailureEvent };

      await service.handleEvents(body);
      expect(mockFormSgTransactionService.handleRecipientNotificationDelivery).toBeCalledWith(
        formSgRecipientNotificationDeliveryFailureEvent,
      );
    });

    it('should throw DynamoDbException when there is error calling model.create method', async () => {
      const body: EventLoggingRequest = { event: formSgProcessInitEvent };
      const errorMessage = 'random error';

      mockFormSgTransactionService.handleProcessInit.mockRejectedValueOnce(new Error(errorMessage));

      await expect(service.handleEvents(body)).rejects.toThrowError(
        new EventsHandlingException(COMPONENT_ERROR_CODE.EVENTS_SERVICE, errorMessage),
      );
    });
  });
});
