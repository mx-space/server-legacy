import { WebSocketServer } from '@nestjs/websockets'
import { Server } from 'http'
import { EventTypes } from './events.types'

export class BaseGateway {
  @WebSocketServer()
  server: Server
  wsClients: SocketIO.Socket[] = []
  messageFormat(type: EventTypes, message: any) {
    return {
      type,
      data: message,
    }
  }
  async broadcase(event: EventTypes, message: any) {
    for (const c of this.wsClients) {
      c.send(this.messageFormat(event, message))
    }
  }
  handleDisconnect(client: SocketIO.Socket) {
    for (let i = 0; i < this.wsClients.length; i++) {
      if (this.wsClients[i] === client) {
        this.wsClients.splice(i, 1)
        break
      }
    }
  }
}
