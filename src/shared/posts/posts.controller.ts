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
  Put,
  Delete,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiQuery, ApiSecurity, ApiTags, ApiParam } from '@nestjs/swagger'
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

  @Put(':id')
  @ApiParam({ name: 'id', example: '5e6f67e85b303781d28072a3' })
  @UseGuards(AuthGuard('jwt'))
  async modifyPost(@Body() postDto: PostDto, @Param('id') postId: IdDto['id']) {
    const validPost = await this.postService.findPostById(postId)
    if (!validPost) {
      throw new BadRequestException('文章丢失了 (　ﾟдﾟ)')
    }
    // update category information
    const { categoryId } = postDto
    if (categoryId !== (validPost.categoryId as any)) {
      const originCategory = await this.postService.findCategoryById(
        (validPost.categoryId as any) as string,
      )
      const newCategory = await this.postService.findCategoryById(categoryId)
      // if (originCategory) {
      originCategory.count--
      await originCategory.save()
      // }
      if (!newCategory) {
        throw new BadRequestException('你还没有这个分类啦 (>﹏<)')
      }
      // if (newCategory) {
      newCategory.count++
      await newCategory.save()
      // }
    }
    const updateDocument = await this.postService.update(
      { _id: postId },
      postDto as any,
      { omitUndefined: true },
    )
    return {
      ...updateDocument,
      msg: updateDocument.nModified ? '修改成功' : '没有文章被修改',
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ type: 'string', name: 'id' })
  async deletePost(@Param('id') id: IdDto['id']) {
    const r = await this.postService.deletePost(id)
    return { ...r, msg: r.deletedCount ? '删除成功' : '删除失败' }
  }
}
