/*
 * @Author: Innei
 * @Date: 2020-05-26 11:10:24
 * @LastEditTime: 2020-05-26 12:49:04
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/auth/auth.controller.ts
 * @Copyright
 */

import {
  Controller,
  Get,
  UseGuards,
  Scope,
  Post,
  Body,
  Delete,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Master } from '../core/decorators/guest.decorator'
import { AuthService } from './auth.service'
import { RolesGuard } from './roles.guard'
import { Auth } from '../core/decorators/auth.decorator'
import { InjectModel } from 'nestjs-typegoose'
import { User } from '../../libs/db/src/models/user.model'
import { ReturnModelType } from '@typegoose/typegoose'
import { Transform } from 'class-transformer'
import { IsDate, IsOptional } from 'class-validator'
import { IdDto } from '../shared/base/dto/id.dto'

export class TokenDto {
  @IsDate()
  @IsOptional()
  @Transform((v) => new Date(v))
  expired: Date
}

@Controller({
  path: 'auth',
  scope: Scope.REQUEST,
})
@ApiTags('Auth Routes')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiOperation({ summary: '判断当前 Token 是否有效 ' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  checkLogged(@Master() isMaster: boolean) {
    return { ok: ~~isMaster, isGuest: !isMaster }
  }

  @Get('token')
  @Auth()
  async getOrVerifyToken(@Query('token') token?: string) {
    if (typeof token === 'string') {
      return await this.authService.verifyCustomToken(token)
    }
    return
  }

  @Post('token')
  @Auth()
  async generateToken(@Body() body: TokenDto) {
    const { expired } = body
    const token = await this.authService.generateAccessToken()
    const model = {
      expired,
      token,
    }
    await this.authService.saveToken(model)
    return model
  }
  @Delete('token')
  @Auth()
  async deleteToken(@Query() query: IdDto) {
    const { id } = query
    await this.authService.deleteToken(id)
    return 'OK'
  }
}