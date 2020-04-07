import Menu from '@libs/db/models/menu.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { BaseService } from '../base/base.service'

@Injectable()
export class MenuService extends BaseService<Menu> {
  constructor(@InjectModel(Menu) menuModel: ReturnModelType<typeof Menu>) {
    super(menuModel)
  }
}
