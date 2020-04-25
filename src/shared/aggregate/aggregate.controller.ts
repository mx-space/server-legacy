import { FileType } from '@libs/db/models/file.model'
import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiProperty, ApiTags } from '@nestjs/swagger'
import { RolesGuard } from 'src/auth/roles.guard'
import { ConfigsService } from 'src/configs/configs.service'
import { Master } from 'src/core/decorators/guest.decorator'
import MasterService from 'src/master/master.service'
import { AggregateService } from 'src/shared/aggregate/aggregate.service'
import { ImageService } from '../uploads/image.service'
import { RandomTypeDto } from './dtos/random.dto'
import { TopQueryDto } from './dtos/top.dto'

@Controller('aggregate')
@ApiTags('Aggregate Routes')
@UseGuards(RolesGuard)
export class AggregateController {
  constructor(
    private readonly service: AggregateService,
    private readonly configs: ConfigsService,
    private readonly userService: MasterService,
    private readonly imageService: ImageService,
  ) {}
  @Get()
  async aggregate(@Master() isMaster: boolean) {
    return {
      user: await this.userService.getMasterInfo(),
      top: await this.top({ size: 6 }, isMaster),
      seo: this.configs.seo,
      categories: await this.service.getAllCategory(),
      pageMeta: await this.service.getAllPages('title _id slug order'),
    }
  }

  @Get('top')
  @ApiProperty({ description: '获取最新发布的内容' })
  async top(@Query() query: TopQueryDto, @Master() isMaster: boolean) {
    const { size } = query
    return await this.service.topActivity(size, isMaster)
  }

  @Get('random')
  async getRandomImage(@Query() query: RandomTypeDto) {
    const { type, imageType = FileType.IMAGE, size = 1 } = query

    return await this.service.getRandomContent(type, imageType, size)
  }
}
