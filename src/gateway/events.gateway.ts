import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'

import { Server } from 'socket.io'

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  sendMessage(type: string, message: any) {
    return {
      type,
      data: message,
    }
  }
  @SubscribeMessage('events')
  onEvent(client: SocketIO.Socket, data: any) {
    return {
      type: 'message',
      data: 'hello',
    }
  }

  handleConnection(client: SocketIO.Socket) {
    client.send({ type: 'connect' })
  }
  handleDisconnect(client: SocketIO.Socket) {
    client.send({ type: 'close' })
  }
}
