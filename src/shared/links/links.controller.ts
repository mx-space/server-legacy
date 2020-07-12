/*
 * @Author: Innei
 * @Date: 2020-06-05 21:26:33
 * @LastEditTime: 2020-07-12 12:26:15
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/links/links.controller.ts
 * @Coding with Love
 */

import { Link, LinkState, LinkType } from '@libs/db/models/link.model'
import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UnprocessableEntityException,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { BaseCrud } from '../base/base.controller'
import { LinksService } from './links.service'
import { PermissionInterceptor } from '../../core/interceptors/permission.interceptors'
import { isMongoId } from 'class-validator'

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
      state: LinkState.Audit,
    })
    return 'OK'
  }

  @Patch('audit/:id')
  async approveFriend(@Param('id') id: string) {
    if (!isMongoId(id)) {
      throw new UnprocessableEntityException('ID must be mongo ID')
    }
    await this.service.updateById(id, { state: LinkState.Pass })
    return 'OK'
  }
}
