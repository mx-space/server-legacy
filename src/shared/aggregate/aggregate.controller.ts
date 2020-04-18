import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AggregateService } from 'src/shared/aggregate/aggregate.service'

@Controller('aggregate')
@ApiTags('Aggregate Routes')
export class AggregateController {
  constructor(private readonly service: AggregateService) {}

  @Get()
  async top() {
    return await this.service.topActivity()
  }
}
