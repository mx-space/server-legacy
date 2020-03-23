import { User, UserDocument } from '@libs/db/models/user.model'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
  UseGuards,
  Req,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { AuthService } from 'src/auth/auth.service'
import { LoginDto, UserDto } from 'src/master/dto/user.dto'
import MasterService from 'src/master/master.service'
import { RolesGuard } from 'src/auth/roles.guard'
import { Master } from 'src/core/decorators/guest.decorator'
import { CurrentUser } from 'src/core/decorators/current-user.decorator'

@Controller('master')
@ApiTags('Master Routes')
export class MasterController {
  constructor(
    private readonly masterService: MasterService,
    private readonly authService: AuthService,
  ) {}
  @Get('/')
  @ApiOperation({ summary: '获取主人信息' })
  async getMasterInfo() {
    return await this.masterService.getMasterInfo()
  }

  @Post('/sign_up')
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
  async login(@Body() dto: LoginDto, @CurrentUser() user: UserDocument) {
    return { token: await this.authService.signToken(user._id) }
  }

  @Get('check_logged')
  @ApiOperation({ summary: '判断当前 Token 是否有效 ' })
  @ApiSecurity('bearer')
  // @UseGuards(AuthGuard('jwt'))
  @UseGuards(RolesGuard)
  async checkLogged(@Master() isMaster: boolean) {
    return { ok: Number(isMaster), isGuest: !isMaster }
  }
}
