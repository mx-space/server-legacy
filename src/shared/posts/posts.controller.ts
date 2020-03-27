import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { RolesGuard } from 'src/auth/roles.guard'
import { Master } from 'src/core/decorators/guest.decorator'
import { PermissionInterceptor } from 'src/core/interceptors/permission.interceptors'
import { IdDto } from 'src/shared/base/dto/id.dto'
import { addCondition } from 'src/shared/utils'
import { CategoryAndSlug, PostDto } from './dto'
import { PostsService } from './posts.service'

@Controller('posts')
@ApiTags('Post Routes')
@UseGuards(RolesGuard)
@UseInterceptors(PermissionInterceptor)
@ApiSecurity('bearer')
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @Get()
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
  async getByCateAndSlug(@Param() params: CategoryAndSlug) {
    const { category, slug } = params
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
    return await this.postService.findPostById(query.id)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createNew(@Body() postDto: PostDto) {
    const _id = Types.ObjectId()
    const {
      text,
      title,
      slug = _id,
      categoryId,
      summary,
      hide = false,
      options,
    } = postDto
    const validCategory = await this.postService.findCategoryById(categoryId)
    if (!validCategory) {
      throw new BadRequestException('分类丢失了 ಠ_ಠ')
    }
    // create post document
    const newPostDocument = await this.postService.createNew({
      title,
      text,
      summary,
      slug: slug as string,
      categoryId: validCategory._id,
      hide,
      options,
    })
    validCategory.count += 1
    await validCategory.save()
    return newPostDocument
  }
}
