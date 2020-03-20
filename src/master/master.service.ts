import { Injectable } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { User } from '@libs/db/models/user.model'
import { ReturnModelType } from '@typegoose/typegoose'

@Injectable()
export default class MasterService {
  constructor(
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
  ) {}

  async getMasterInfo() {
    return await this.userModel.findOne()
  }

  async createMaster() {
    const model = await this.userModel.create({
      username: 'test',
      name: 'test',
      password: 'yyyy',
      mail: '',
      url: '',
    })

    console.log(model)
    return model
  }
}
