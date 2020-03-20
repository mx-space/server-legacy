import { Controller, Inject, Get, Param } from '@nestjs/common'
import { PostsService } from './posts.service'
import { ApiTags } from '@nestjs/swagger'
import { CategoryAndSlug } from 'src/posts/dto'

@Controller('posts')
@ApiTags('Post Routes')
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @Get('/:category/:slug')
  async getByCateAndSlug(@Param() params: CategoryAndSlug) {
    const { category, slug } = params
    // TODO check permission (guard)
    const post = await this.postService.getByCateAndSlug({ slug })

    return post
  }
}
