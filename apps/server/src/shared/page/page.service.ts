/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-05-31 18:26:40
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/page/page.service.ts
 * @Coding with Love
 */

import Page from '@libs/db/models/page.model'
import { HttpService, Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { ConfigsService } from '../../common/global'
import { WriteBaseService } from '../base/base.service'

@Injectable()
export class PageService extends WriteBaseService<Page> {
  constructor(
    @InjectModel(Page) private readonly pageModel: ReturnModelType<typeof Page>,
    private readonly http: HttpService,
    private readonly configs: ConfigsService,
  ) {
    super(pageModel, http, configs)
  }
}
