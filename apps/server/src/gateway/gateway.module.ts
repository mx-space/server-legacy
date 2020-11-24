/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-05-31 19:07:17
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/gateway/gateway.module.ts
 * @Coding with Love
 */

import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { AdminEventsGateway } from './admin/events.gateway'
import { WebEventsGateway } from './web/events.gateway'

@Module({
  imports: [AuthModule],
  providers: [AdminEventsGateway, WebEventsGateway],
  exports: [AdminEventsGateway, WebEventsGateway],
})
export class GatewayModule {}
