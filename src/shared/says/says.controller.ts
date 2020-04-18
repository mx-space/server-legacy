import { Controller } from '@nestjs/common'
import { BaseCrud } from 'src/shared/base/base.controller'
import { Say } from '@libs/db/models/say.model'
import { SaysService } from 'src/shared/says/says.service'
import { ApiTags } from '@nestjs/swagger'

@Controller('says')
@ApiTags('Says Routes')
export class SaysController extends BaseCrud<Say> {
  constructor(private readonly service: SaysService) {
    super(service)
  }
}
