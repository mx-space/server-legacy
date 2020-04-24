import { Controller, Get, UseGuards, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AggregateService } from 'src/shared/aggregate/aggregate.service'
import { ConfigsService } from 'src/configs/configs.service'
import { RolesGuard } from 'src/auth/roles.guard'
import { TopQueryDto } from './dtos/top.dto'
import { Master } from 'src/core/decorators/guest.decorator'

@Controller('aggregate')
@ApiTags('Aggregate Routes')
@UseGuards(RolesGuard)
export class AggregateController {
  constructor(
    private readonly service: AggregateService,
    private readonly configs: ConfigsService,
  ) {}

  @Get('top')
  async top(@Query() query: TopQueryDto, @Master() isMaster: boolean) {
    const { size } = query
    return await this.service.topActivity(size, isMaster)
  }
}
