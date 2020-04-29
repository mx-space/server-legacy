import { Body, Controller, Get, Patch } from '@nestjs/common'
import { ApiResponseProperty, ApiTags } from '@nestjs/swagger'
import { SEODto, UrlDto } from 'src/configs/configs.dto'
import { ConfigsService } from 'src/configs/configs.service'
import { Auth } from 'src/core/decorators/auth.decorator'
import { AdminService } from 'src/shared/admin/admin.service'
import { CommentsService } from 'src/shared/comments/comments.service'
import { NotesService } from 'src/shared/notes/notes.service'
import { PostsService } from 'src/shared/posts/posts.service'

@Controller('admin')
@ApiTags('Admin Routes')
@Auth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly postService: PostsService,
    private readonly noteService: NotesService,
    private readonly commentService: CommentsService,
    private readonly configs: ConfigsService,
  ) {}

  @Get('seo')
  async getSEO() {
    return this.configs.seo
  }

  @Patch('seo')
  @ApiResponseProperty({ type: SEODto })
  async setSEO(@Body() body: SEODto) {
    await this.configs.setSEO(body)
    return this.configs.seo
  }
  @Get('url')
  async getUrl() {
    return this.configs.url
  }
  @Patch('url')
  @ApiResponseProperty({ type: UrlDto })
  async setUrl(@Body() body: UrlDto) {
    return await this.configs.setUrl(body)
  }
}
