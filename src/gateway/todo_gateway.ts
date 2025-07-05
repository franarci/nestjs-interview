import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class TodoGateway {
  @WebSocketServer()
  server: Server;

  sendProgress(userId: string, payload: { progress: number; total: number }) {
    this.server.to(userId).emit('bulk-progress', payload);
  }

  handleConnection(socket: Socket) {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      socket.join(userId);
    }
  }
}
