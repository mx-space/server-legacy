import {
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
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { RolesGuard } from 'apps/server/src/auth/roles.guard'
import { Auth } from 'shared/core/decorators/auth.decorator'
import { Master } from 'shared/core/decorators/guest.decorator'
import { PermissionInterceptor } from 'shared/core/interceptors/permission.interceptors'
import { IdDto } from 'apps/server/src/shared/base/dto/id.dto'
import { SearchDto } from 'apps/server/src/shared/base/dto/search.dto'
import { addConditionToSeeHideContent, yearCondition } from 'shared/utils'
import {
  IpLocation,
  IpRecord,
} from '../../../../../shared/core/decorators/ip.decorator'
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
    private readonly service: PostsService,
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
    return await this.service.findWithPaginator(condition, {
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

    const categoryDocument = await this.service.getCategoryBySlug(category)
    if (!categoryDocument) {
      throw new NotFoundException('该分类未找到 (｡•́︿•̀｡)')
    }
    const postDocument = await this.service
      .findOne({
        slug,
        categoryId: categoryDocument._id,
        // ...condition,
      })
      .populate('category')

    if (!postDocument) {
      throw new NotFoundException('该文章未找到 (｡ŏ_ŏ)')
    }
    this.service.updateReadCount(postDocument, location.ip)
    return postDocument
  }

  @Get(':id')
  @ApiOperation({ summary: '根据 ID 查找' })
  async getById(@Param() query: IdDto, @IpLocation() location: IpRecord) {
    const doc = await this.service.findPostById(query.id)
    this.service.updateReadCount(doc, location.ip)
    return doc
  }

  @Post()
  @Auth()
  @ApiOperation({ summary: '新建一篇文章' })
  async createNew(@Body() body: PostDto) {
    const _id = Types.ObjectId()
    const {
      text,
      title,
      slug = _id,
      categoryId,
      summary,
      hide = false,
      options,
      tags,
      copyright,
    } = body
    const newPostDocument = await this.service.createNew({
      text,
      title,
      // @ts-ignore
      slug,
      // @ts-ignore
      categoryId,
      summary,
      hide,
      options,
      tags,
      copyright,
    })
    new Promise(async (resolve) => {
      const category = await this.service.getCategoryById(
        newPostDocument.categoryId,
      )
      this.webgateway.broadcase(EventTypes.POST_CREATE, {
        ...newPostDocument.toJSON(),
        category,
      })
      this.service.RecordImageDimensions(newPostDocument._id)
      resolve(null)
    })
    return newPostDocument
  }

  @Put(':id')
  @Auth()
  @ApiOperation({ summary: '修改一篇文章' })
  async modifyPost(@Body() body: PostDto, @Param() params: IdDto) {
    const { id } = params

    const updateDocument = await this.service.update({ _id: id }, body as any)
    // emit event
    new Promise((resolve) => {
      this.service.RecordImageDimensions(id)
      this.service
        .findById(id)
        .lean()
        .then((doc) => {
          this.webgateway.broadcase(EventTypes.POST_UPDATE, doc)
        })
      resolve(null)
    })
    return {
      ...updateDocument,
      message: updateDocument.nModified ? '修改成功' : '没有文章被修改',
    }
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: '删除一篇文章' })
  async deletePost(@Param() params: IdDto) {
    const { id } = params
    await this.service.deletePost(id)
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
    return await this.service.findWithPaginator(
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
    const res = await this.service.updateLikeCount(id, ip)
    if (!res) {
      throw new UnprocessableEntityException('你已经支持过啦!')
    }
    return 'OK'
  }
}
