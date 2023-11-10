import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller('health-check')
@ApiTags('health-check')
export class HealthCheckController {
  constructor(private readonly healthcheckService: HealthCheckService) {}

  @Get()
  @HealthCheck()
  async getHealthStatus() {
    return await this.healthcheckService.check([]);
  }
}
