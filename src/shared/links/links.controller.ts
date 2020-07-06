/*
 * @Author: Innei
 * @Date: 2020-06-05 21:26:33
 * @LastEditTime: 2020-07-06 20:28:09
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/links/links.controller.ts
 * @Coding with Love
 */

import { Link, LinkType } from '@libs/db/models/link.model'
import { Body, Controller, Post, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { BaseCrud } from '../base/base.controller'
import { LinksService } from './links.service'
import { PermissionInterceptor } from '../../core/interceptors/permission.interceptors'

@Controller('links')
@ApiTags('Link Routes')
@UseInterceptors(PermissionInterceptor)
export class LinksController extends BaseCrud<Link> {
  constructor(private readonly service: LinksService) {
    super(service)
  }

  @Post('audit')
  async applyForLink(@Body() body: Link) {
    await this.service.createNew({
      ...body,
      type: LinkType.Friend,
      audit: true,
    })
    return 'OK'
  }
}
