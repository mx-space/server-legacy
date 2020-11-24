/*
 * @Author: Innei
 * @Date: 2020-10-01 13:47:59
 * @LastEditTime: 2020-10-02 13:45:39
 * @LastEditors: Innei
 * @FilePath: /mx-server-next/src/shared/posts/posts.resolver.ts
 * @Mark: Coding with Love
 */
import { NotFoundException, UseGuards, UseInterceptors } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { RolesGQLGuard } from 'apps/server/src/auth/roles.guard'
import { MasterGQL } from 'apps/server/src/core/decorators/guest.decorator'
import { PermissionGQLInterceptor } from 'apps/server/src/core/interceptors/permission.interceptors'
import {
  addConditionToSeeHideContent,
  yearCondition,
} from 'apps/server/src/utils'
import { IdInputArgsDto, PagerArgsDto } from '../../graphql/args/id.input'
import { PostItemModel, PostPagerModel } from '../../graphql/models/post.model'
import { SlugTitleInput } from './posts.input'
import { PostsService } from './posts.service'

@Resolver()
@UseGuards(RolesGQLGuard)
@UseInterceptors(PermissionGQLInterceptor)
export class PostsResolver {
  constructor(private postService: PostsService) {}

  @Query(() => PostItemModel)
  public async getPostById(@Args() { id }: IdInputArgsDto) {
    return await this.postService.findPostById(id)
  }

  @Query(() => PostItemModel)
  public async getPostBySlug(@Args() { slug, category }: SlugTitleInput) {
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

    return postDocument
  }

  @Query(() => PostPagerModel)
  // @Query(() => [PostItemModel])
  public async getPostsWithPager(
    @MasterGQL() isMaster: boolean,
    @Args() args: PagerArgsDto,
  ) {
    const { page = 1, size = 10, sortBy, sortOrder, year } = args

    const condition = {
      ...addConditionToSeeHideContent(isMaster),
      ...yearCondition(year),
    }
    return await this.postService.findWithPaginator(condition, {
      limit: size,
      skip: (page - 1) * size,
      sort: sortBy ? { [sortBy]: sortOrder || -1 } : { created: -1 },
      populate: 'category',
    })
  }
  // TODO search
}
