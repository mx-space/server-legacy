import { Controller, Get, UseGuards, Query } from '@nestjs/common'
import { ApiTags, ApiProperty } from '@nestjs/swagger'
import { AggregateService } from 'src/shared/aggregate/aggregate.service'
import { ConfigsService } from 'src/configs/configs.service'
import { RolesGuard } from 'src/auth/roles.guard'
import { TopQueryDto } from './dtos/top.dto'
import { Master } from 'src/core/decorators/guest.decorator'
import MasterService from 'src/master/master.service'
import { ImageService } from '../uploads/image.service'
import { FileTypeQueryDto } from '../uploads/dto/filetype.dto'
import { FileType } from '@libs/db/models/file.model'
import { RandomTypeDto } from './dtos/random.dto'

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

    switch (type) {
      case 'IMAGE':
        return await this.imageService.getRandomImages(size, imageType)
      // TODO random api
      default:
        break
    }
  }
}
