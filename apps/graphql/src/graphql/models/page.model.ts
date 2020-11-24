/*
 * @Author: Innei
 * @Date: 2020-10-03 10:32:06
 * @LastEditTime: 2020-10-04 09:29:17
 * @LastEditors: Innei
 * @FilePath: /mx-server-next/src/graphql/models/page.model.ts
 * @Mark: Coding with Love
 */
import Page from '@libs/db/models/page.model'
import { Field, Int, ObjectType } from '@nestjs/graphql'
import {
  PagerModel,
  PagerModelImplements,
  TextModelImplementsImageRecordModel,
} from './base.model'

@ObjectType()
export class PageItemModel
  extends TextModelImplementsImageRecordModel
  implements Page {
  allowComment: boolean
  @Field(() => Int)
  commentsIndex: number

  @Field(() => Int)
  order: number

  slug: string

  subtitle?: string

  created: Date
  modified: Date
}

@ObjectType()
export class PagePagerModel implements PagerModelImplements {
  @Field(() => [PageItemModel], { nullable: true })
  data: PageItemModel[]

  @Field(() => PagerModel)
  pager: PagerModel
}
