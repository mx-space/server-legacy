/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-05-30 14:13:25
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/auth/auth.module.ts
 * @Copyright
 */

import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { LocalStrategy } from './local.strategy'
import { AuthController } from './auth.controller'
import { EventsGateway } from '../gateway/admin/events.gateway'

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
  providers: [AuthService, JwtStrategy, LocalStrategy, EventsGateway],
  controllers: [AuthController],
  exports: [JwtStrategy, LocalStrategy, AuthService, jwtModule],
})
export class AuthModule {}
