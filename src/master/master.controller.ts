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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger'
import { DocumentType } from '@typegoose/typegoose'
import { AuthService } from 'src/auth/auth.service'
import { RolesGuard } from 'src/auth/roles.guard'
import { CurrentUser } from 'src/core/decorators/current-user.decorator'
import { Master } from 'src/core/decorators/guest.decorator'
import { LoginDto, UserDto, UserPatchDto } from 'src/master/dto/user.dto'
import MasterService from 'src/master/master.service'
import { IpLocation, IpRecord } from 'src/core/decorators/ip.decorator'
import { getAvatar } from 'src/shared/utils'

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
    const info = await this.masterService.getMasterInfo()

    const avatar = getAvatar(info.mail)
    return { ...info.toObject(), avatar }
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

  @Post('sign_up')
  @ApiOperation({ summary: '注册重定向' })
  async signUp(@Body() userDto: UserDto) {
    return await this.register(userDto)
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
    const avatar = getAvatar(mail)
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
  @ApiSecurity('bearer')
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
    return await this.masterService.changePassword(user, body)
  }
}
