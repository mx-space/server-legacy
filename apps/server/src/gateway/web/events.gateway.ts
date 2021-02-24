/*
 * @Author: Innei
 * @Date: 2020-05-21 18:59:01
 * @LastEditTime: 2021-02-24 21:22:29
 * @LastEditors: Innei
 * @FilePath: /server/apps/server/src/gateway/web/events.gateway.ts
 * @Copyright
 */

import { RedisNames } from '@libs/common/redis/redis.types'
import {
  GatewayMetadata,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  WsResponse,
} from '@nestjs/websockets'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import dayjs = require('dayjs')
import { RedisService } from 'nestjs-redis'
import { from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { BaseGateway } from '../base.gateway'
import { EventTypes } from '../events.types'
import { DanmakuDto } from './dtos/danmaku.dto'
@WebSocketGateway<GatewayMetadata>({
  namespace: 'web',
})
export class WebEventsGateway
  extends BaseGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly redisService: RedisService) {
    super()
  }

  // @SubscribeMessage(EventTypes.VISITOR_ONLINE)
  async sendOnlineNumber() {
    const redisClient = this.redisService.getClient(RedisNames.MaxOnlineCount)
    const dateFormat = dayjs().format('YYYY-MM-DD')

    return {
      online: this.wsClients.length,
      todayMaxOnline: +(await redisClient.get(dateFormat)) || 0,
      todayOnlineTotal: +(await redisClient.get(dateFormat + '_total')) || 0,
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
      this.broadcast(EventTypes.DANMAKU_CREATE, data)
      client.send([])
    })
  }

  async handleConnection(client: SocketIO.Socket) {
    this.wsClients.push(client)
    this.broadcast(EventTypes.VISITOR_ONLINE, await this.sendOnlineNumber())

    new Promise(async (r, j) => {
      const redisClient = this.redisService.getClient(RedisNames.MaxOnlineCount)
      const dateFormat = dayjs().format('YYYY-MM-DD')
      const count = +(await redisClient.get(dateFormat)) || 0
      await redisClient.set(dateFormat, Math.max(count, this.wsClients.length))
      const key = dateFormat + '_total'
      const totalCount = +(await redisClient.get(key)) || 0
      await redisClient.set(key, totalCount + 1)

      r(null)
    })

    super.handleConnect(client)
  }
  async handleDisconnect(client: SocketIO.Socket) {
    super.handleDisconnect(client)
    this.broadcast(EventTypes.VISITOR_OFFLINE, await this.sendOnlineNumber())
  }
}
