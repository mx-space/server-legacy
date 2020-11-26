/*
 * @Author: Innei
 * @Date: 2020-06-05 21:26:33
 * @LastEditTime: 2020-07-12 13:46:23
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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { isMongoId } from 'class-validator'
import { omit } from 'lodash'
import { RolesGuard } from '../../auth/roles.guard'
import { PermissionInterceptor } from '../../../../../shared/core/interceptors/permission.interceptors'
import { BaseCrud } from '../base/base.controller'
import { LinksService } from './links.service'

@Controller('links')
@ApiTags('Link Routes')
@UseInterceptors(PermissionInterceptor)
@UseGuards(RolesGuard)
export class LinksController extends BaseCrud<Link> {
  constructor(private readonly service: LinksService) {
    super(service)
  }

  @Post('audit')
  async applyForLink(@Body() body: Link & { author: string }) {
    await this.service.createNew({
      ...omit(body, 'author'),
      type: LinkType.Friend,
      state: LinkState.Audit,
    })
    this.service.sendEmail(body)
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
