import { Injectable } from '@nestjs/common'
import { BaseService } from '../base/base.service'
import { Link } from '@libs/db/models/link.model'
import { InjectModel } from 'nestjs-typegoose'
import { ReturnModelType } from '@typegoose/typegoose'

@Injectable()
export class LinksService extends BaseService<Link> {
  constructor(
    @InjectModel(Link) private readonly model: ReturnModelType<typeof Link>,
  ) {
    super(model)
  }
}
