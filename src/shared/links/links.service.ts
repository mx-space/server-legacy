import { Link } from '@libs/db/models/link.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { BaseService } from '../base/base.service'

@Injectable()
export class LinksService extends BaseService<Link> {
  constructor(
    @InjectModel(Link) private readonly model: ReturnModelType<typeof Link>,
  ) {
    super(model)
  }
}
