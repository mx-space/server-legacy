import { User } from '@libs/db/models/user.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import nanoid = require('nanoid')
import { AuthService } from 'src/auth/auth.service'
@Injectable()
export default class MasterService {
  constructor(
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
    private readonly authService: AuthService,
  ) {}

  async getMasterInfo() {
    return await this.userModel.findOne()
  }

  async createMaster(model: User) {
    const authCode = nanoid(10)
    const res = await this.userModel.create({ ...model, authCode })
    const token = await this.authService.signToken(res._id)
    return { token, username: res.username, authCode: res.authCode }
  }
}
