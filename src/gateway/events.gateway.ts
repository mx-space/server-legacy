import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'

import { Server } from 'socket.io'
import { EventTypes } from './events.types'

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server
  wsClients: SocketIO.Socket[] = []
  messageFormat(type: EventTypes, message: any) {
    return {
      type,
      data: message,
    }
  }
  broadcase(event: EventTypes, message: any) {
    for (let c of this.wsClients) {
      c.send(this.messageFormat(event, message))
    }
  }
  handleConnection(client: SocketIO.Socket) {
    this.wsClients.push(client)
    client.send(
      this.messageFormat(EventTypes.GATEWAY_CONNECT, 'websock 已连接'),
    )
  }
  handleDisconnect(client: SocketIO.Socket) {
    for (let i = 0; i < this.wsClients.length; i++) {
      if (this.wsClients[i] === client) {
        this.wsClients.splice(i, 1)
        break
      }
    }
    client.send(
      this.messageFormat(EventTypes.GATEWAY_DISCONNECT, 'websock 断开'),
    )
  }
}
