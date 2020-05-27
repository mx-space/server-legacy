/*
 * @Author: Innei
 * @Date: 2020-05-21 18:59:01
 * @LastEditTime: 2020-05-27 16:35:56
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
} from '@nestjs/websockets'
import { BaseGateway } from '../base.gateway'
import { EventTypes } from '../events.types'
import { Danmaku } from '../../../libs/db/src/models/danmaku.model'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'

@WebSocketGateway<GatewayMetadata>({
  namespace: 'web',
})
export class WebEventsGateway extends BaseGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectModel(Danmaku)
    private readonly danmakuModel: ReturnModelType<typeof Danmaku>,
  ) {
    super()
  }

  @SubscribeMessage(EventTypes.VISITOR_ONLINE)
  sendOnlineNumber() {
    return {
      online: this.wsClients.length,
      timestamp: new Date().toISOString(),
    }
  }
  str = []
  // TODO
  @SubscribeMessage(EventTypes.DANMAKU_CREATE)
  createNewDanmaku(@MessageBody() data: any) {
    this.str.push(data)
    const dto = plainToClass(Danmaku, data)
    validate(dto).then((err) => {
      if (err.length === 0) {
        this.danmakuModel.create(data).then((r) => {
          this.broadcase(EventTypes.DANMAKU_CREATE, this.str)
        })
      } else {
        throw err
      }
    })
  }

  handleConnection(client: SocketIO.Socket) {
    this.wsClients.push(client)
    this.broadcase(EventTypes.VISITOR_ONLINE, this.sendOnlineNumber())
    client.send(
      this.messageFormat(EventTypes.GATEWAY_CONNECT, 'WebSocket 已连接'),
    )
  }
  handleDisconnect(client: SocketIO.Socket) {
    super.handleDisconnect(client)
    this.broadcase(EventTypes.VISITOR_OFFLINE, this.sendOnlineNumber())
    client.send(
      this.messageFormat(EventTypes.GATEWAY_CONNECT, 'WebSocket 断开'),
    )
  }
}
