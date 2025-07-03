import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class TodoGateway {
  @WebSocketServer()
  server: Server;

  sendProgress(userId: string, progress: number) {
    this.server.to(userId).emit('bulk-progress', { progress });
  }

  handleConnection(client: any) {
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(userId);
    }
  }
}