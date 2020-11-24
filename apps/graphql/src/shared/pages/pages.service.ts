/*
 * @Author: Innei
 * @Date: 2020-10-04 09:23:05
 * @LastEditTime: 2020-10-04 09:42:11
 * @LastEditors: Innei
 * @FilePath: /mx-server-next/src/shared/pages/pages.service.ts
 * @Mark: Coding with Love
 */
import Page from '@libs/db/models/page.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { isMongoId } from 'class-validator'
import { InjectModel } from 'nestjs-typegoose'
import { BaseService } from '../base/base.service'

@Injectable()
export class PagesService extends BaseService<Page> {
  constructor(
    @InjectModel(Page) private readonly model: ReturnModelType<typeof Page>,
  ) {
    super(model)
  }

  async getPageByIdOrSlug(unique: any) {
    return isMongoId(unique)
      ? await super.findByIdException(unique)
      : await super.findOneAsyncException({
          slug: unique,
        })
  }
}
