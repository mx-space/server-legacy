import { User } from '@libs/db/models/user.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { JwtPayload } from 'src/master/interfaces/jwt-payload.interface'
import nanoid = require('nanoid')
@Injectable()
export default class MasterService {
  constructor(
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
  ) {}

  async getMasterInfo() {
    return await this.userModel.findOne()
  }

  async createMaster(model: User) {
    const authCode = nanoid(10)
    return await this.userModel.create({ ...model, authCode })
  }
}
