import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { BaseCrud } from '../base/base.controller'
import { LinksService } from './links.service'
import { Link } from '@libs/db/models/link.model'

@Controller('links')
@ApiTags('Link Routes')
export class LinksController extends BaseCrud<Link> {
  constructor(private readonly service: LinksService) {
    super(service)
  }
}
