import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { RolesGuard } from 'src/auth/roles.guard'
import { Master } from 'src/core/decorators/guest.decorator'
import { PermissionInterceptor } from 'src/core/interceptors/permission.interceptors'
import { IdDto } from 'src/shared/base/dto/id.dto'
import { addCondition } from 'src/shared/utils'
import { CategoryAndSlug } from './dto'
import { PostsService } from './posts.service'

@Controller('posts')
@ApiTags('Post Routes')
@UseGuards(RolesGuard)
@UseInterceptors(PermissionInterceptor)
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @Get()
  // @UseGuards(RolesGuard)
  @ApiSecurity('bearer')
  @ApiQuery({ name: 'page', example: 1, required: false })
  @ApiQuery({ name: 'size', example: 10, required: false })
  @ApiQuery({ name: 'select', required: false })
  async getAll(
    @Query('page') page?: number,
    @Query('size') size?: number,
    @Query('select') select?: string,
    @Master() isMaster?: boolean,
  ) {
    const condition = addCondition(isMaster)
    return await this.postService.findWithPaginator(
      condition,
      {},
      { limit: size, skip: (page - 1) * size, select },
    )
  }

  @Get('/:category/:slug')
  @ApiSecurity('bearer')
  async getByCateAndSlug(
    @Param() params: CategoryAndSlug,
    @Master() isMaster: boolean,
  ) {
    const { category, slug } = params
    // const condition = addCondition(isMaster)
    // search category

    const categoryDocument = await this.postService.getCategoryBySlug(category)
    if (!categoryDocument) {
      throw new BadRequestException('该分类未找到 (｡•́︿•̀｡)')
    }
    const postDocument = await this.postService
      .findOne({
        slug,
        categoryId: categoryDocument._id,
        // ...condition,
      })
      .populate('categoryId')

    if (!postDocument) {
      throw new BadRequestException('该文章未找到 (｡ŏ_ŏ)')
    }

    return postDocument
  }

  @Get(':id')
  async getById(@Query() query: IdDto) {
    return this.postService.findById(query.id)
  }
}
