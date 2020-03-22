import { Injectable } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { User } from '@libs/db/models/user.model'
import { ReturnModelType } from '@typegoose/typegoose'
import { JwtPayload } from 'src/master/interfaces/jwt-payload.interface'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
    private readonly jwtService: JwtService,
  ) {}

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
