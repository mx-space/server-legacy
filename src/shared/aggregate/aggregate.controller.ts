import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AggregateService } from 'src/shared/aggregate/aggregate.service'
import { ConfigsService } from 'src/configs/configs.service'

@Controller('aggregate')
@ApiTags('Aggregate Routes')
export class AggregateController {
  constructor(
    private readonly service: AggregateService,
    private readonly configs: ConfigsService,
  ) {}

  @Get()
  async top() {
    return await this.service.topActivity()
  }
}
