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
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { IdDto } from 'src/shared/base/dto/id.dto'
import { PagerDto } from 'src/shared/base/dto/pager.dto'
import { PageService } from './page.service'

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
    return this.service.createNew(body)
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async modifiedPage(@Body() body: Page, @Param() params: IdDto) {
    const { id } = params
    return this.service.updateById(id, body)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async deletePage(@Param() params: IdDto) {
    return this.service.deleteOneAsync({
      _id: params.id,
    })
  }
}
