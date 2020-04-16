import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { RolesGuard } from 'src/auth/roles.guard'
import { Master } from 'src/core/decorators/guest.decorator'
import { PermissionInterceptor } from 'src/core/interceptors/permission.interceptors'
import { IdDto } from 'src/shared/base/dto/id.dto'
import { PagerDto } from 'src/shared/base/dto/pager.dto'
import { SearchDto } from 'src/shared/base/dto/search.dto'
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
  @ApiOperation({ summary: '获取全部文章带分页器' })
  async getAll(@Master() isMaster?: boolean, @Query() query?: PagerDto) {
    const { size, select, page, year } = query
    const condition = addCondition(isMaster)
    return await this.postService.findWithPaginator(condition, {
      limit: size,
      skip: (page - 1) * size,
      select,
      sort: { created: -1 },
    })
  }

  @Get('/:category/:slug')
  @ApiOperation({ summary: '根据分类名和自定义别名获取' })
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
      .populate('category')

    if (!postDocument) {
      throw new BadRequestException('该文章未找到 (｡ŏ_ŏ)')
    }

    return postDocument
  }

  @Get(':id')
  @ApiOperation({ summary: '根据 ID 查找' })
  async getById(@Param() query: IdDto) {
    return await this.postService.findPostById(query.id)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '新建一篇文章' })
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
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '修改一篇文章' })
  async modifyPost(@Body() postDto: PostDto, @Param() params: IdDto) {
    const { id } = params
    const postId = id
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
  @ApiOperation({ summary: '删除一篇文章' })
  async deletePost(@Param() params: IdDto) {
    const { id } = params
    const r = await this.postService.deletePost(id)
    return { ...r, msg: r.deletedCount ? '删除成功' : '删除失败' }
  }

  @Get('search')
  @ApiOperation({ summary: '搜索文章' })
  async searchPost(@Query() query: SearchDto) {
    const { keyword, page, size } = query
    const select = '_id title created modified categoryId'
    const keywordArr = keyword
      .split(/\s+/)
      .map((item) => new RegExp(String(item), 'ig'))
    return await this.postService.findWithPaginator(
      { $or: [{ title: { $in: keywordArr } }, { text: { $in: keywordArr } }] },
      {
        limit: size,
        skip: (page - 1) * size,
        select,
        populate: 'categoryId',
      },
    )
  }
}
