/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-05-31 19:07:17
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/gateway/gateway.module.ts
 * @Coding with Love
 */

import { Module, HttpModule } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { AdminEventsGateway } from './admin/events.gateway'
import { WebEventsGateway } from './web/events.gateway'
import { PostsService } from '../shared/posts/posts.service'
import { NotesService } from '../shared/notes/notes.service'
import { PageService } from '../shared/page/page.service'

@Module({
  imports: [AuthModule, HttpModule],
  providers: [
    AdminEventsGateway,
    WebEventsGateway,
    // PostsService,
    // NotesService,
    // PageService,
  ],
  exports: [AdminEventsGateway, WebEventsGateway],
})
export class GatewayModule {}
