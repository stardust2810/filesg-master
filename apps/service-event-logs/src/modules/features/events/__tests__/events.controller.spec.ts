import { EventLoggingRequest } from '@filesg/backend-common';
import { Test, TestingModule } from '@nestjs/testing';

import { formSgProcessInitEvent, mockEventsService } from '../__mocks__/events.service.mock';
import { EventsController } from '../events.controller';
import { EventsService } from '../events.service';

describe('EventsController', () => {
  let controller: EventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: mockEventsService }],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleEvents', () => {
    it('should call methods with the right params', async () => {
      const body: EventLoggingRequest = { event: formSgProcessInitEvent };
      await controller.handleEvents(body);

      expect(mockEventsService.handleEvents).toBeCalledWith(body);
    });
  });
});
