/*
 * @Author: Innei
 * @Date: 2020-05-21 11:05:42
 * @LastEditTime: 2020-05-23 12:38:37
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/gateway/admin/events.gateway.ts
 * @MIT
 */

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
  async disconnect(client: SocketIO.Socket) {
    client.send(this.messageFormat(EventTypes.AUTH_FAILED, '认证失败'))
    client.disconnect()
  }
  async handleConnection(client: SocketIO.Socket) {
    const token = client.handshake.query.token
    if (!token) {
      return this.disconnect(client)
    }
    try {
      const payload = this.jwtService.verify(token)
      const user = await this.authService.verifyPayload(payload)
      if (!user) {
        return this.disconnect(client)
      }
    } catch {
      return this.disconnect(client)
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
