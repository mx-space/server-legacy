/*
 * @Author: Innei
 * @Date: 2020-06-05 21:26:33
 * @LastEditTime: 2021-01-17 20:28:49
 * @LastEditors: Innei
 * @FilePath: /server/apps/server/src/shared/links/links.controller.ts
 * @Coding with Love
 */

import { Link } from '@libs/db/models/link.model'
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { Auth } from 'core/decorators/auth.decorator'
import { PermissionInterceptor } from '../../../../../shared/core/interceptors/permission.interceptors'
import { RolesGuard } from '../../auth/roles.guard'
import { BaseCrud } from '../base/base.controller'
import { LinksService } from './links.service'

class LinkQueryDto {
  @IsString()
  author: string
}

@Controller('links')
@ApiTags('Link Routes')
@UseInterceptors(PermissionInterceptor)
@UseGuards(RolesGuard)
export class LinksController extends BaseCrud<Link> {
  constructor(private readonly service: LinksService) {
    super(service)
  }

  @Get('state')
  @Auth()
  async getLinkCount() {
    return await this.service.getCount()
  }

  @Post('audit')
  async applyForLink(@Body() body: Link, @Query() query: LinkQueryDto) {
    await this.service.applyForLink(body)
    this.service.sendToMaster(query.author, body)

    return 'OK'
  }

  @Patch('audit/:id')
  @Auth()
  async approveLink(@Param('id') id: string) {
    const doc = await this.service.approveLink(id)

    if (doc.email) {
      this.service.sendToCandidate(doc)
    }
    return 'OK'
  }
}
