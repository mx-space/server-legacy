import { Controller, Get, Body, Post } from '@nestjs/common'
import { ApiTags, ApiBody } from '@nestjs/swagger'
import MasterService from 'src/master/master.service'
import { UserDto } from 'src/master/dto/user.dto'
@Controller('master')
@ApiTags('Master Routes')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}
  @Get('/')
  async getMasterInfo() {
    return await this.masterService.getMasterInfo()
  }

  @Post('/')
  async register(@Body() userDto: UserDto) {
    return await this.masterService.createMaster()
  }
}
