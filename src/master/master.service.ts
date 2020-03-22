import { User, UserDocument } from '@libs/db/models/user.model'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ReturnModelType, DocumentType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import nanoid = require('nanoid')
import { JwtPayload } from 'src/master/interfaces/jwt-payload.interface'
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

  async signToken(_id: string) {
    const { authCode } = await this.userModel.findById(_id).select('authCode')
    const payload = {
      _id,
      authCode,
    }
    // console.log(process.env.SECRET)
    return this.jwtService.sign(payload)
  }

  async verifyPayload(payload: JwtPayload): Promise<boolean> {
    const user = await this.userModel.findById(payload._id).select('authCode')

    return user && user.authCode === payload.authCode
  }
}
