/*
 * @Author: Innei
 * @Date: 2020-05-21 11:05:42
 * @LastEditTime: 2020-09-02 13:03:57
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/master/master.controller.ts
 * @Coding with Love
 */
import { User, UserDocument } from '@libs/db/models/user.model'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { DocumentType } from '@typegoose/typegoose'
import { AuthService } from 'apps/server/src/auth/auth.service'
import { RolesGuard } from 'apps/server/src/auth/roles.guard'
import { CurrentUser } from 'shared/core/decorators/current-user.decorator'
import { Master } from 'shared/core/decorators/guest.decorator'
import { IpLocation, IpRecord } from 'shared/core/decorators/ip.decorator'
import {
  LoginDto,
  UserDto,
  UserPatchDto,
} from 'apps/server/src/master/dto/user.dto'
import MasterService from 'apps/server/src/master/master.service'
import { getAvatar } from 'shared/utils'

@Controller('master')
@ApiTags('Master Routes')
export class MasterController {
  constructor(
    private readonly masterService: MasterService,
    private readonly authService: AuthService,
  ) {}
  @Get()
  @ApiOperation({ summary: '获取主人信息' })
  async getMasterInfo() {
    return await this.masterService.getMasterInfo()
  }

  @Post('register')
  @SerializeOptions({
    excludePrefixes: ['password'],
  })
  @ApiOperation({ summary: '注册' })
  async register(@Body() userDto: UserDto) {
    userDto.name = userDto.name ?? userDto.username
    return await this.masterService.createMaster(userDto as User)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '登录' })
  @UseGuards(AuthGuard('local'))
  async login(
    @Body() dto: LoginDto,
    @CurrentUser() user: UserDocument,
    @IpLocation() ipLocation: IpRecord,
  ) {
    const footstep = await this.masterService.recordFootstep(ipLocation.ip)
    const { name, username, created, url, mail } = user
    const avatar = user.avatar ?? getAvatar(mail)

    return {
      token: await this.authService.signToken(user._id),
      ...footstep,
      name,
      username,
      created,
      url,
      mail,
      avatar,
      expiresIn: 7,
    }
  }

  @Get('check_logged')
  @ApiOperation({ summary: '判断当前 Token 是否有效 ' })
  @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'))
  @UseGuards(RolesGuard)
  checkLogged(@Master() isMaster: boolean) {
    return { ok: Number(isMaster), isGuest: !isMaster }
  }

  @Patch()
  @ApiOperation({ summary: '修改主人的信息 ' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async patchMasterData(
    @Body() body: UserPatchDto,
    @CurrentUser() user: DocumentType<User>,
  ) {
    return await this.masterService.patchUserData(user, body)
  }
}
