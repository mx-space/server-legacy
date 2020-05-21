import { JwtService } from '@nestjs/jwt'
import {
  GatewayMetadata,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets'
import { AuthService } from '../../auth/auth.service'
import { BaseGateway } from '../base.gateway'
import { EventTypes } from '../events.types'

@WebSocketGateway<GatewayMetadata>({ namespace: 'admin' })
export class EventsGateway extends BaseGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {
    super()
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
    super.handleDisconnect(client)
    client.send(
      this.messageFormat(EventTypes.GATEWAY_DISCONNECT, 'websock 断开'),
    )
  }
}
