/*
 * @Author: Innei
 * @Date: 2020-05-17 16:17:04
 * @LastEditTime: 2020-06-12 20:02:55
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/page/page.controller.ts
 * @Coding with Love
 */

import Page from '@libs/db/models/page.model'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CannotFindException } from 'apps/server/src/core/exceptions/cant-find.exception'
import { IdDto } from 'apps/server/src/shared/base/dto/id.dto'
import { PageService } from './page.service'

@ApiTags('Page Routes')
@Controller('pages')
export class PageController {
  constructor(private readonly service: PageService) {}

  @Get()
  async getPagesSummary() {
    const pages = await this.service.find(
      {},
      { sort: { order: -1, created: 1 }, select: '-text -type' },
    )
    return { data: pages }
  }

  @Get(':id')
  async getPageById(@Param() params: IdDto) {
    const page = this.service.findById(params.id)
    if (!page) {
      throw new CannotFindException()
    }
    return page
  }

  @Get('slug/:slug')
  async getPageBySlug(@Param('slug') slug: string) {
    const page = await this.service.findOne({
      slug,
    })

    if (!page) {
      throw new CannotFindException()
    }
    return page
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async createPage(@Body() body: Page) {
    const doc = await this.service.createNew(body)
    this.service.RecordImageDimensions(doc._id)
    return doc
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async modifiedPage(@Body() body: Page, @Param() params: IdDto) {
    const { id } = params
    const res = await this.service.update({ _id: id }, body)
    this.service.RecordImageDimensions(id)
    return res
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async deletePage(@Param() params: IdDto) {
    return await this.service.deleteOneAsync({
      _id: params.id,
    })
  }
}
