import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { LocalStrategy } from 'src/auth/local.strategy'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory() {
        return {
          secret: process.env.SECRET,
          signOptions: {
            expiresIn: '7d',
          },
        }
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [JwtStrategy, LocalStrategy, AuthService],
})
export class AuthModule {}
