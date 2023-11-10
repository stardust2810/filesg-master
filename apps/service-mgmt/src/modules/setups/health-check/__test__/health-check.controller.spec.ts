import { RedisService } from '@filesg/redis';
import { TerminusModule } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { mockRedisService } from '../../../../__mocks__/redis.service.mock';
import { FileSGConfigModule } from '../../config/config.module';
import { HealthCheckController } from '../health-check.controller';
import { RedisHealthIndicator } from '../redis-health.health';

describe('HealthCheckController', () => {
  let controller: HealthCheckController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
      imports: [TerminusModule, FileSGConfigModule],
      providers: [
        RedisHealthIndicator,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    controller = module.get<HealthCheckController>(HealthCheckController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
