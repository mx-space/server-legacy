import { User } from '@libs/db/models/user.model'
import { PassportStrategy } from '@nestjs/passport'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt'
import { JwtPayload } from 'src/master/interfaces/jwt-payload.interface'
import { AuthService } from './auth.service'

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectModel(User) private userModel: ReturnModelType<typeof User>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET,
    } as StrategyOptions)
  }

  async validate(payload: JwtPayload) {
    return await this.authService.verifyPayload(payload)
  }
}
