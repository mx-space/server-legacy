import Page from '@libs/db/models/page.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { BaseService } from '../base/base.service'

@Injectable()
export class PageService extends BaseService<Page> {
  constructor(
    @InjectModel(Page) private readonly pageModel: ReturnModelType<typeof Page>,
  ) {
    super(pageModel)
  }
}
