import { JwtService } from '@nestjs/jwt'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { AuthService } from '../auth/auth.service'
import { EventTypes } from './events.types'

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

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

  async handleConnection(client: SocketIO.Socket) {
    const token = client.handshake.query.token
    const payload = this.jwtService.verify(token)
    const user = await this.authService.verifyPayload(payload)
    if (!user) {
      client.send(this.messageFormat(EventTypes.AUTH_FAILED, '认证失败'))
      return client.disconnect()
    }
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
