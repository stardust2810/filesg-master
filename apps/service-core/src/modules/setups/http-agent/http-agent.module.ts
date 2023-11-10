import { Module } from '@nestjs/common';

import { HttpsAgentProvider } from './http-agent.provider';

@Module({
  providers: [HttpsAgentProvider],
  exports: [HttpsAgentProvider],
})
export class HttpAgentModule {}
