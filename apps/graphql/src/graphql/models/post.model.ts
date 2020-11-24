/*
 * @Author: Innei
 * @Date: 2020-10-01 14:17:38
 * @LastEditTime: 2020-10-01 21:19:31
 * @LastEditors: Innei
 * @FilePath: /mx-server-next/src/graphql/models/post.model.ts
 * @Mark: Coding with Love
 */
import { TextImageRecordType } from '@libs/db/models/base.model'
import Post from '@libs/db/models/post.model'
import { Field, ObjectType } from '@nestjs/graphql'
import {
  BaseGLModel,
  ImageRecordModel,
  PagerModel,
  PagerModelImplements,
  PostItemCount,
} from './base.model'
import { CategoryItemModel } from './category.model'
@ObjectType()
export class PostItemModel extends BaseGLModel implements Post {
  public readonly title: string

  public readonly slug: string

  public readonly text: string

  public readonly allowComment: boolean

  @Field(() => CategoryItemModel)
  public readonly category: CategoryItemModel

  // @ts-ignore
  public readonly categoryId: string

  public readonly commentsIndex: number

  public readonly copyright: boolean

  @Field(() => PostItemCount)
  public readonly count: PostItemCount

  public readonly hide: boolean

  @Field(() => [ImageRecordModel], { nullable: true })
  public readonly images?: TextImageRecordType[]

  public readonly summary?: string

  @Field(() => [String], { nullable: true })
  public readonly tags: string[]

  //@ts-ignore
  created: string
  // @ts-ignore
  modified: string
}

@ObjectType()
export class PostPagerModel implements PagerModelImplements {
  @Field(() => PagerModel)
  pager: PagerModel
  @Field(() => [PostItemModel])
  data: PostItemModel[]
}
