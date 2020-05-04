import { Body, Controller, Get, Patch } from '@nestjs/common'
import { ApiResponseProperty, ApiTags } from '@nestjs/swagger'
import { SEODto, UrlDto } from 'src/configs/configs.dto'
import { ConfigsService } from 'src/configs/configs.service'
import { Auth } from 'src/core/decorators/auth.decorator'
import { OptionsService } from 'src/shared/options/admin.service'
import { CommentsService } from 'src/shared/comments/comments.service'
import { NotesService } from 'src/shared/notes/notes.service'
import { PostsService } from 'src/shared/posts/posts.service'

@Controller('options')
@ApiTags('Option Routes')
@Auth()
export class OptionsController {
  constructor(
    private readonly adminService: OptionsService,
    private readonly postService: PostsService,
    private readonly noteService: NotesService,
    private readonly commentService: CommentsService,
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
}
