import { Injectable } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { User } from '@libs/db/models/user.model'
import { ReturnModelType } from '@typegoose/typegoose'
import { JwtService } from '@nestjs/jwt'
import nanoid = require('nanoid')
@Injectable()
export default class MasterService {
  constructor(
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
    private readonly jwtService: JwtService,
  ) {}

  async getMasterInfo() {
    return await this.userModel.findOne()
  }

  async createMaster(model: User) {
    const authCode = nanoid(10)
    return await this.userModel.create({ ...model, authCode })
  }

  signToken(_id: string, authCode: string) {
    const payload = {
      _id,
      authCode,
    }
    // console.log(process.env.SECRET)
    return this.jwtService.sign(payload)
  }
}
