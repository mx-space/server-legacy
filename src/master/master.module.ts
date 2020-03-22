import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './jwt.strategy'
import { LocalStrategy } from './local.strategy'
import { MasterController } from './master.controller'
import MasterService from './master.service'

@Module({
  providers: [MasterService, LocalStrategy, JwtStrategy],
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
  controllers: [MasterController],
  exports: [MasterService],
})
export class MasterModule {}
