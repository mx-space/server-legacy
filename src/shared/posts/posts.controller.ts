import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiSecurity, ApiTags } from '@nestjs/swagger'
import { RolesGuard } from 'src/auth/roles.guard'
import { Master } from 'src/core/decorators/guest.decorator'
import { CategoryAndSlug } from './dto'
import { PostsService } from './posts.service'
import { IdDto } from 'src/shared/base/dto/id.dto'

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

  @Get(':id')
  async getById(@Query() query: IdDto) {
    return this.postService.findById(query.id)
  }
}
