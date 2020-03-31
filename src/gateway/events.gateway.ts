/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Socket } from 'dgram'
import { Server } from 'ws'

@WebSocketGateway(8080)
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
  onEvent(client: Socket, data: any) {
    return {
      type: 'message',
      data: 'hello',
    }
  }

  handleConnection(client: Socket) {
    client.send('connect')
  }
  handleDisconnect(client: Socket) {
    console.log('disconnect')
  }
}
