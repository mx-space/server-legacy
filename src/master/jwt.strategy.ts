import { Strategy, StrategyOptions, ExtractJwt } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { InjectModel } from 'nestjs-typegoose'
import { User } from '@libs/db/models/user.model'
import { ReturnModelType } from '@typegoose/typegoose'
import MasterService from 'src/master/master.service'
import { JwtPayload } from 'src/master/interfaces/jwt-payload.interface'

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectModel(User) private userModel: ReturnModelType<typeof User>,
    private readonly masterService: MasterService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET,
    } as StrategyOptions)
  }

  async validate(payload: JwtPayload) {
    return await this.masterService.verifyPayload(payload)
  }
}
