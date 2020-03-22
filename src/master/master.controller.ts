import {
  Controller,
  Get,
  Body,
  Post,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiHeader, ApiSecurity } from '@nestjs/swagger'
import MasterService from 'src/master/master.service'
import { UserDto, LoginDto } from 'src/master/dto/user.dto'
import { User, UserDocument } from '@libs/db/models/user.model'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from 'src/master/current-user.decorator'

@Controller('master')
@ApiTags('Master Routes')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}
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
  @ApiOperation({ summary: '登录' })
  @UseGuards(AuthGuard('local'))
  async login(@Body() dto: LoginDto, @CurrentUser() user: UserDocument) {
    return { token: await this.masterService.signToken(user._id) }
  }

  @Get('check_logged')
  @ApiOperation({ summary: '判断当前 Token 是否有效 ' })
  @ApiSecurity('bearer')
  @UseGuards(AuthGuard('jwt'))
  async checkLogged() {
    return { ok: 1 }
  }
}
