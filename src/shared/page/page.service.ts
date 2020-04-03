import { Injectable } from '@nestjs/common'
import { BaseService } from '../base/base.service'
import Page from '@libs/db/models/page.model'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'

@Injectable()
export class PageService extends BaseService<Page> {
  constructor(
    @InjectModel(Page) private readonly pageModel: ReturnModelType<typeof Page>,
  ) {
    super(pageModel)
  }
}
