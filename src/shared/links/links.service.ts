/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-07-12 14:18:04
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/links/links.service.ts
 * @Coding with Love
 */

import { Link } from '@libs/db/models/link.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { User } from '../../../libs/db/src/models/user.model'
import { ConfigsService } from '../../configs/configs.service'
import { Mailer } from '../../plugins/mailer'
import { BaseService } from '../base/base.service'

@Injectable()
export class LinksService extends BaseService<Link> {
  constructor(
    @InjectModel(Link) private readonly model: ReturnModelType<typeof Link>,
    private readonly configs: ConfigsService,
    @InjectModel(User)
    private readonly userModel: ReturnModelType<typeof User>,
  ) {
    super(model)
  }
  async sendEmail(model: Link & { author: string }) {
    const enable = this.configs.get('mailOptions').enable
    if (!enable || process.env.NODE_ENV === 'development') {
      console.log(`来自 ${model.author} 的友链请求: 
        站点标题: ${model.name}
        站点网站: ${model.url}
        站点描述: ${model.description}`)
      return
    }
    const mailerOptions = {
      ...this.configs.get('mailOptions'),
      name: this.configs.get('seo').title,
    }
    const master = await this.userModel.findOne()
    const mailer = new Mailer(
      mailerOptions.user,
      mailerOptions.pass,
      mailerOptions.options,
    ).getInstance()
    mailer.sendMail({
      to: master.mail,
      subject: `[${this.configs.get('seo').title}] 新的朋友 ${model.author}`,
      text: `来自 ${model.author} 的友链请求: 
        站点标题: ${model.name}
        站点网站: ${model.url}
        站点描述: ${model.description}
      `,
    })
  }
}
