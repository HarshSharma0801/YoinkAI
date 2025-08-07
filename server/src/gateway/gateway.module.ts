import { Module } from '@nestjs/common';
import { EditorGateway } from './editor.gateway';
import { OpenAIModule } from '../openai/openai.module';

@Module({
  imports: [OpenAIModule],
  providers: [EditorGateway],
})
export class GatewayModule {}
