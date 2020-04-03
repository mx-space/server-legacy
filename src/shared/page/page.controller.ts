import {
  Controller,
  Get,
  Param,
  Query,
  Body,
  Post,
  Put,
  UseGuards,
  Delete,
} from '@nestjs/common'
import { PageService } from './page.service'
import { IdDto } from 'src/shared/base/dto/id.dto'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { PagerDto } from 'src/shared/base/dto/pager.dto'
import Page from '@libs/db/models/page.model'
import { AuthGuard, PassportModule } from '@nestjs/passport'

@ApiTags('Page Routes')
@Controller('pages')
export class PageController {
  constructor(private readonly service: PageService) {}

  @Get()
  async getPagesSummary(@Query() query: PagerDto) {
    const { page, size, select } = query
    const pages = await this.service.find(
      {},
      { sort: { order: -1 }, select: '-text -type -subtitle' },
    )
    if (!pages.length) {
      throw new CannotFindException()
    }
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
    return await this.service.createNew(body)
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async modifiedPage(@Body() body: Page, @Param() params: IdDto) {
    const { id } = params
    return await this.service.updateById(id, body)
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
