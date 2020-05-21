import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { LocalStrategy } from './local.strategy'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { JwtModule } from '@nestjs/jwt'

const jwtModule = JwtModule.registerAsync({
  useFactory() {
    return {
      secret: process.env.SECRET || 'asdhaisouxcjzuoiqdnasjduw',
      signOptions: {
        expiresIn: '7d',
      },
    }
  },
})
@Module({
  imports: [PassportModule, jwtModule],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [JwtStrategy, LocalStrategy, AuthService, jwtModule],
})
export class AuthModule {}
