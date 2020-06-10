/*
 * @Author: Innei
 * @Date: 2020-06-05 21:26:33
 * @LastEditTime: 2020-06-07 16:02:36
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/links/links.controller.ts
 * @Coding with Love
 */

import { Link } from '@libs/db/models/link.model'
import { Body, Controller, Post, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { BaseCrud } from '../base/base.controller'
import { LinksService } from './links.service'

@Controller('links')
@ApiTags('Link Routes')
export class LinksController extends BaseCrud<Link> {
  constructor(private readonly service: LinksService) {
    super(service)
  }

  @Post('audit')
  async applyForLink(@Body() body: Link) {
    await this.service.createNew({ ...body, audit: true })
    return 'OK'
  }
}
