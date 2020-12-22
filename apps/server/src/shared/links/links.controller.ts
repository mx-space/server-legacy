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
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnprocessableEntityException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { isMongoId, IsString } from 'class-validator'
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
    this.service.sendEmail(query.author, body)

    return 'OK'
  }

  @Patch('audit/:id')
  @Auth()
  async approveFriend(@Param('id') id: string) {
    if (!isMongoId(id)) {
      throw new UnprocessableEntityException('ID must be mongo ID')
    }
    await this.service.updateById(id, { state: LinkState.Pass })
    return 'OK'
  }
}
