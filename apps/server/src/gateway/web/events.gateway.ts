/*
 * @Author: Innei
 * @Date: 2020-05-21 18:59:01
 * @LastEditTime: 2020-06-12 20:04:06
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/gateway/web/events.gateway.ts
 * @Copyright
 */

import {
  GatewayMetadata,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
} from '@nestjs/websockets'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { BaseGateway } from '../base.gateway'
import { EventTypes } from '../events.types'
import { DanmakuDto } from './dtos/danmaku.dto'
@WebSocketGateway<GatewayMetadata>({
  namespace: 'web',
})
export class WebEventsGateway
  extends BaseGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  constructor() {
    super()
  }

  @SubscribeMessage(EventTypes.VISITOR_ONLINE)
  sendOnlineNumber() {
    return {
      online: this.wsClients.length,
      timestamp: new Date().toISOString(),
    }
  }
  @SubscribeMessage(EventTypes.DANMAKU_CREATE)
  createNewDanmaku(
    @MessageBody() data: DanmakuDto,
    @ConnectedSocket() client: SocketIO.Socket,
  ) {
    const validator = plainToClass(DanmakuDto, data)
    validate(validator).then((errors) => {
      if (errors.length > 0) {
        return client.send(errors)
      }
      this.broadcase(EventTypes.DANMAKU_CREATE, data)
      client.send([])
    })
  }

  handleConnection(client: SocketIO.Socket) {
    this.wsClients.push(client)
    this.broadcase(EventTypes.VISITOR_ONLINE, this.sendOnlineNumber())
    super.handleConnect(client)
  }
  handleDisconnect(client: SocketIO.Socket) {
    super.handleDisconnect(client)
    this.broadcase(EventTypes.VISITOR_OFFLINE, this.sendOnlineNumber())
  }
}
