import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OpenAIService } from '../openai/openai.service';

interface PromptMessage {
  projectId: string;
  prompt: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class EditorGateway {
  @WebSocketServer()
  server: Server;

  constructor(private openaiService: OpenAIService) {}

  @SubscribeMessage('prompt')
  async handlePrompt(
    @MessageBody() data: PromptMessage,
    @ConnectedSocket() client: Socket,
  ) {
    const { projectId, prompt } = data;

    try {
      client.join(projectId);

      await this.openaiService.generateResponse(projectId, prompt, this);
    } catch (error) {
      console.error('Error handling prompt:', error);
      this.emitError(projectId, 'Failed to process prompt');
    }
  }

  @SubscribeMessage('joinProject')
  handleJoinProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.projectId);
  }

  emitTextChunk(projectId: string, content: string) {
    this.server.to(projectId).emit('textChunk', { content });
  }

  emitGenerationStarted(projectId: string, elementId: string, type: string) {
    this.server.to(projectId).emit('generationStarted', { elementId, type });
  }

  emitGenerationCompleted(
    projectId: string,
    elementId: string,
    assetUrl: string,
  ) {
    this.server
      .to(projectId)
      .emit('generationCompleted', { elementId, assetUrl });
  }

  emitElementAdded(projectId: string, element: any) {
    this.server.to(projectId).emit('elementAdded', { element });
  }

  emitError(projectId: string, message: string) {
    this.server.to(projectId).emit('error', { message });
  }

  emitInfo(projectId: string, message: string) {
    this.server.to(projectId).emit('info', { message });
  }
}
