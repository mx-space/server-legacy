import {
  Controller,
  Inject,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import { PostsService } from './posts.service'
import { ApiTags, ApiProperty, ApiQuery, ApiSecurity } from '@nestjs/swagger'
import { CategoryAndSlug } from './dto'
import { RolesGuard } from 'src/auth/roles.guard'
import { Master } from 'src/core/decorators/guest.decorator'

@Controller('posts')
@ApiTags('Post Routes')
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @ApiSecurity('bearer')
  async getAll(
    @Query('page') page?: number,
    @Query('size') size?: number,
    @Query('select') select?: string,
    @Master() isMaster?: boolean,
  ) {
    const condition = isMaster
      ? {
          $or: [{ hide: false }, { hide: true }],
        }
      : { $or: [{ hide: false }] }
    return await this.postService.findWithPaginator(
      condition,
      {},
      { limit: size, skip: (page - 1) * size, select },
    )
  }

  @Get('/:category/:slug')
  async getByCateAndSlug(@Param() params: CategoryAndSlug) {
    const { category, slug } = params
    // TODO check permission (guard)
    const post = await this.postService.getByCateAndSlug({ slug })

    return post
  }
}
