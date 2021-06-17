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
  Query,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CannotFindException } from 'shared/core/exceptions/cant-find.exception'
import { MongoIdDto } from 'apps/server/src/shared/base/dto/id.dto'
import { PageService } from './page.service'

import { PagerDto } from '../base/dto/pager.dto'

@ApiTags('Page Routes')
@Controller('pages')
export class PageController {
  constructor(private readonly service: PageService) {}

  @Get()
  async getPagesSummary(@Query() query: PagerDto) {
    const { size, select, page } = query

    return await this.service.findWithPaginator(
      {},
      {
        limit: size,
        skip: (page - 1) * size,
        select,
      },
    )
  }

  @Get(':id')
  async getPageById(@Param() params: MongoIdDto) {
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
  async modifiedPage(@Body() body: Page, @Param() params: MongoIdDto) {
    const { id } = params
    const res = await this.service.update({ _id: id }, body)
    this.service.RecordImageDimensions(id)
    return res
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async deletePage(@Param() params: MongoIdDto) {
    return await this.service.deleteOneAsync({
      _id: params.id,
    })
  }
}
