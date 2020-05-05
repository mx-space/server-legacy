import { Body, Controller, Get, Patch } from '@nestjs/common'
import { ApiResponseProperty, ApiTags } from '@nestjs/swagger'
import {
  CommentOptions,
  ImageBedDto,
  MailOptionsDto,
  SEODto,
  UrlDto,
} from 'src/configs/configs.dto'
import { ConfigsService } from 'src/configs/configs.service'
import { OptionsService } from 'src/shared/options/admin.service'
import { Auth } from '../../core/decorators/auth.decorator'

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
    return this.configs.config
  }

  @Patch('seo')
  @ApiResponseProperty({ type: SEODto })
  async setSEO(@Body() body: SEODto) {
    await this.configs.setSEO(body)
    return this.configs.seo
  }

  @Patch('url')
  @ApiResponseProperty({ type: UrlDto })
  async setUrl(@Body() body: UrlDto) {
    return await this.configs.setUrl(body)
  }

  @Patch('comments')
  async setCommentsOption(@Body() body: CommentOptions) {
    return await this.configs.patch('commentOptions', body)
  }
  @Patch('mail')
  async setMailOptions(@Body() body: MailOptionsDto) {
    return await this.configs.patch('mailOptions', body)
  }
  @Patch('imageBed')
  async setImageBed(@Body() body: ImageBedDto) {
    return await this.configs.patch('imageBed', body)
  }
}
