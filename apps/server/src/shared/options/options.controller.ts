/*
 * @Author: Innei
 * @Date: 2020-05-08 20:01:58
 * @LastEditTime: 2020-09-09 13:39:46
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/options/options.controller.ts
 * @Coding with Love
 */

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import {
  ConfigsService,
  IConfig,
} from 'apps/server/src/common/global/configs/configs.service'
import { OptionsService } from 'apps/server/src/shared/options/options.service'
import { Auth } from '../../../../../shared/core/decorators/auth.decorator'
import { AdminEventsGateway } from '../../gateway/admin/events.gateway'
import { NotesService } from '../notes/notes.service'
import { PageService } from '../page/page.service'
import { PostsService } from '../posts/posts.service'
import { isDev } from 'utils/index'
class ConfigKeyDto {
  @IsString()
  @IsNotEmpty()
  key: keyof IConfig
}

@Controller('options')
@ApiTags('Option Routes')
@Auth()
export class OptionsController {
  constructor(
    private readonly adminService: OptionsService,
    private readonly configs: ConfigsService,
    private readonly postService: PostsService,
    private readonly noteService: NotesService,
    private readonly pageService: PageService,
    private readonly adminEventGateway: AdminEventsGateway,
  ) {}

  @Get()
  getOption() {
    return this.configs.getConfig()
  }

  @Patch(':key')
  async patch(
    @Param() params: ConfigKeyDto,
    @Body() body: Record<string, any>,
  ) {
    if (typeof body !== 'object') {
      throw new UnprocessableEntityException('body must be object')
    }
    return await this.adminService.patchAndValid(params.key, body)
  }

  @Get('refresh_images')
  async refreshImagesAllMarkdown(@Query('socket_id') socketId: string) {
    const socket = this.adminEventGateway.findClientById(socketId)
    if (!socket && !isDev) {
      return
    }

    ;[this.postService, this.noteService, this.pageService].forEach(
      async (s) => {
        s.refreshImageSize(socket)
      },
    )
  }
}
