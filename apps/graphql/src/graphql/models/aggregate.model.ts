/*
 * @Author: Innei
 * @Date: 2020-10-03 10:21:19
 * @LastEditTime: 2020-10-03 10:45:04
 * @LastEditors: Innei
 * @FilePath: /mx-server-next/src/graphql/models/aggregate.model.ts
 * @Mark: Coding with Love
 */
import { Field, ObjectType, PartialType } from '@nestjs/graphql'
import { MasterModel } from './master.model'
import { NoteItemModel } from './note.model'
import { PageItemModel } from './page.model'
import { PostItemModel } from './post.model'

@ObjectType()
class User extends PartialType(MasterModel) {}

@ObjectType()
class TopModel {
  @Field(() => [PostItemModel], { nullable: true })
  notes: NoteItemModel[]

  @Field(() => [PostItemModel], { nullable: true })
  posts: PostItemModel[]
}

@ObjectType()
export class AggregateQueryModel {
  @Field(() => User)
  user: User

  @Field(() => NoteItemModel)
  lastestNote: NoteItemModel

  @Field(() => [PageItemModel], { nullable: true })
  pages: PageItemModel[]

  top: TopModel
}

@ObjectType()
export class TimelineModel {
  @Field(() => [NoteItemModel], { nullable: true })
  notes: NoteItemModel[]

  @Field(() => [PostItemModel], { nullable: true })
  posts: PostItemModel[]
}
