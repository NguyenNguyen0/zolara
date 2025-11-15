import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { AgentGateway } from './agent.gateway';

@Module({
  imports: [ConfigModule],
  controllers: [AgentController],
  providers: [AgentService, AgentGateway],
  exports: [AgentService, AgentGateway],
})
export class AgentModule {}
