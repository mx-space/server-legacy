import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UnprocessableEntityException,
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
import { SearchDto } from 'src/shared/base/dto/search.dto'
import { addConditionToSeeHideContent, yearCondition } from 'src/utils'
import { IpLocation, IpRecord } from '../../core/decorators/ip.decorator'
import { EventTypes } from '../../gateway/events.types'
import { WebEventsGateway } from '../../gateway/web/events.gateway'
import { CategoryAndSlug, PostDto, PostQueryDto } from './dto'
import { PostsService } from './posts.service'

@Controller('posts')
@ApiTags('Post Routes')
@UseGuards(RolesGuard)
@UseInterceptors(PermissionInterceptor)
@ApiSecurity('bearer')
export class PostsController {
  constructor(
    private readonly postService: PostsService,
    private readonly webgateway: WebEventsGateway,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取全部文章带分页器' })
  async getAll(@Master() isMaster?: boolean, @Query() query?: PostQueryDto) {
    const { size, select, page, year, sortBy, sortOrder } = query
    const condition = {
      ...addConditionToSeeHideContent(isMaster),
      ...yearCondition(year),
    }
    return await this.postService.findWithPaginator(condition, {
      limit: size,
      skip: (page - 1) * size,
      select,
      sort: sortBy ? { [sortBy]: sortOrder || -1 } : { created: -1 },
      populate: 'category',
    })
  }

  @Get('/:category/:slug')
  @ApiOperation({ summary: '根据分类名和自定义别名获取' })
  async getByCateAndSlug(
    @Param() params: CategoryAndSlug,
    @IpLocation() location: IpRecord,
  ) {
    const { category, slug } = params
    // search category

    const categoryDocument = await this.postService.getCategoryBySlug(category)
    if (!categoryDocument) {
      throw new NotFoundException('该分类未找到 (｡•́︿•̀｡)')
    }
    const postDocument = await this.postService
      .findOne({
        slug,
        categoryId: categoryDocument._id,
        // ...condition,
      })
      .populate('category')

    if (!postDocument) {
      throw new NotFoundException('该文章未找到 (｡ŏ_ŏ)')
    }
    this.postService.updateReadCount(postDocument, location.ip)
    return postDocument
  }

  @Get(':id')
  @ApiOperation({ summary: '根据 ID 查找' })
  async getById(@Param() query: IdDto, @IpLocation() location: IpRecord) {
    const doc = await this.postService.findPostById(query.id)
    this.postService.updateReadCount(doc, location.ip)
    return doc
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
      copyright,
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
      copyright,
    })
    validCategory.count += 1
    await validCategory.save()
    new Promise(async (resolve) => {
      const category = await this.postService.getCategoryById(
        newPostDocument.categoryId,
      )
      this.webgateway.broadcase(EventTypes.POST_CREATE, {
        ...newPostDocument.toJSON(),
        category,
      })
      this.postService.RecordImageDimensions(newPostDocument._id)
      resolve()
    })
    return newPostDocument
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '修改一篇文章' })
  async modifyPost(@Body() post: PostDto, @Param() params: IdDto) {
    const { id } = params
    const postId = id
    const validPost = await this.postService.findPostById(postId)
    if (!validPost) {
      throw new BadRequestException('文章丢失了 (　ﾟдﾟ)')
    }
    // update category information
    const { categoryId } = post
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
      post as any,
      { omitUndefined: true },
    )
    // emit event
    new Promise((resolve) => {
      this.postService.RecordImageDimensions(postId)
      this.postService
        .findById(id)
        .lean()
        .then((doc) => {
          this.webgateway.broadcase(EventTypes.POST_UPDATE, doc)
        })
      resolve()
    })
    return {
      ...updateDocument,
      message: updateDocument.nModified ? '修改成功' : '没有文章被修改',
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '删除一篇文章' })
  async deletePost(@Param() params: IdDto) {
    const { id } = params
    await this.postService.deletePost(id)
    this.webgateway.broadcase(EventTypes.POST_DELETE, id)
    return 'OK'
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
  @Get('_thumbs-up')
  async thumbsUpArticle(
    @Query() query: IdDto,
    @IpLocation() location: IpRecord,
  ) {
    const { ip } = location
    const { id } = query
    const res = await this.postService.updateLikeCount(id, ip)
    if (!res) {
      throw new UnprocessableEntityException('你已经支持过啦!')
    }
    return 'OK'
  }
}
