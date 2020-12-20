import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UnprocessableEntityException,
} from '@nestjs/common'
import { PagerDto } from '../base/dto/pager.dto'
import { RecentlyDto } from './recently.dto'
import { RecentlyService } from './recently.service'

@Controller('recently')
export class RecentlyController {
  constructor(private readonly service: RecentlyService) {}

  @Get('latest')
  async getLatestOne() {
    return await this.service.getLatestOne()
  }

  @Get('/')
  async getList(@Query() pager: PagerDto) {
    console.log(pager)

    const { page, size } = pager

    return await this.service.findWithSimplePager(page, size)
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: RecentlyDto) {
    await this.service.create(body)
    return
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async del(@Param() id: string) {
    const res = await this.service.delete(id)
    if (!res) {
      throw new UnprocessableEntityException('删除失败')
    }

    return
  }
}
