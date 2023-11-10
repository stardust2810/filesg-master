import { RedisService } from '@filesg/redis';
import { TerminusModule } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { FileSGConfigModule } from '../../config/config.module';
import { mockFileSGRedisService } from '../../redis/__mocks__/redis.service.mock';
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
          useValue: mockFileSGRedisService,
        },
      ],
    }).compile();

    controller = module.get<HealthCheckController>(HealthCheckController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
