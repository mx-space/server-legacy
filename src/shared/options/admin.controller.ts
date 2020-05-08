import { Body, Controller, Get, Param, Patch } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { ConfigsService, IConfig } from 'src/configs/configs.service'
import { OptionsService } from 'src/shared/options/admin.service'
import { Auth } from '../../core/decorators/auth.decorator'
class ConfigKeyDto {
  @IsString()
  @IsNotEmpty()
  key: keyof IConfig
}

@Controller('options')
@ApiTags('Option Routes')
@Auth()
export class OptionsController {
  constructor(
    private readonly adminService: OptionsService,
    private readonly configs: ConfigsService,
  ) {}

  @Get()
  getOption() {
    return this.configs.getConfig()
  }

  @Patch(':key')
  async patch(@Param() params: ConfigKeyDto, @Body() body: { name: string }) {
    return await this.adminService.patchAndValid(params.key, body)
  }
}
