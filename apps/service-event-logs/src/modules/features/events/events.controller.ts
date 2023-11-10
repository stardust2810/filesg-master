import { EventLoggingRequest } from '@filesg/backend-common';
import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';

import { EventsService } from './events.service';

@Controller('v1/events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(StatusCodes.NO_CONTENT)
  @ApiBody({ type: EventLoggingRequest })
  async handleEvents(@Body() body: EventLoggingRequest) {
    return await this.eventsService.handleEvents(body);
  }
}
