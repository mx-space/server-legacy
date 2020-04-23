import { Controller, Get, Post, Body } from '@nestjs/common'
import { AdminService } from 'src/shared/admin/admin.service'
import { CommentsService } from 'src/shared/comments/comments.service'
import { NotesService } from 'src/shared/notes/notes.service'
import { PostsService } from 'src/shared/posts/posts.service'
import { ConfigsService } from 'src/configs/configs.service'
import { SEODto } from 'src/configs/configs.dto'
import { ApiTags, ApiResponseProperty } from '@nestjs/swagger'

@Controller('admin')
@ApiTags('Admin Routes')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly postService: PostsService,
    private readonly noteService: NotesService,
    private readonly commentService: CommentsService,
    private readonly configs: ConfigsService,
  ) {}

  @Post('/seo')
  @ApiResponseProperty({ type: SEODto })
  async setSEO(@Body() body: SEODto) {
    await this.configs.setSEO(body)
    return this.configs.seo
  }
}
