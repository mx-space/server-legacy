import { Say } from '@libs/db/models/say.model'
import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { BaseCrud } from 'src/shared/base/base.controller'
import { SaysService } from 'src/shared/says/says.service'

@Controller('says')
@ApiTags('Says Routes')
export class SaysController extends BaseCrud<Say> {
  constructor(private readonly service: SaysService) {
    super(service)
  }
}
