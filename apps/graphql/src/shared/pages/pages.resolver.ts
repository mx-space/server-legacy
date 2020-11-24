/*
 * @Author: Innei
 * @Date: 2020-10-04 09:22:52
 * @LastEditTime: 2020-10-04 09:55:35
 * @LastEditors: Innei
 * @FilePath: /mx-server-next/src/shared/pages/pages.resolver.ts
 * @Mark: Coding with Love
 */
import { UnprocessableEntityException } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'
import {
  PagerArgsDto,
  IdInputArgsDtoOptional,
} from '../../graphql/args/id.input'
import { PageItemModel, PagePagerModel } from '../../graphql/models/page.model'

import { SlugArgsDto } from '../categories/category.input'
import { PagesService } from './pages.service'

@Resolver((of) => PageItemModel)
export class PagesResolver {
  constructor(private readonly service: PagesService) {}

  @Query(() => PagePagerModel)
  async getPages(@Args() args: PagerArgsDto) {
    const { page, size, sortBy, sortOrder } = args
    const res = await this.service.findWithPaginator(
      {},
      {
        limit: size,
        skip: (page - 1) * size,
        sort: sortBy ? { [sortBy]: sortOrder || -1 } : { created: -1 },
      },
    )

    return res
  }

  @Query(() => PageItemModel)
  async getPage(
    @Args() { slug }: SlugArgsDto,
    @Args() { id }: IdInputArgsDtoOptional,
  ) {
    if (!slug && !id) {
      throw new UnprocessableEntityException('id or slug must choice one')
    }

    const res = await this.service.getPageByIdOrSlug(id ?? slug)
    // console.log(res)

    return res
  }
}
