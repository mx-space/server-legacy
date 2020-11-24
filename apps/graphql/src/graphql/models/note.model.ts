/*
 * @Author: Innei
 * @Date: 2020-10-02 14:29:06
 * @LastEditTime: 2020-10-02 15:28:43
 * @LastEditors: Innei
 * @FilePath: /mx-server-next/src/graphql/models/note.model.ts
 * @Mark: Coding with Love
 */
import { TextImageRecordType } from '@libs/db/models/base.model'
import Note, { NoteMusic } from '@libs/db/models/note.model'

import { Field, ID, Int, ObjectType } from '@nestjs/graphql'
import {
  ImageRecordModel,
  PagerModel,
  PagerModelImplements,
} from './base.model'

@ObjectType()
class NoteItemCount {
  @Field(() => Int)
  read?: number

  @Field(() => Int)
  like?: number
}

@ObjectType()
export class NoteItemModel implements Note {
  allowComment: boolean

  @Field(() => ID)
  _id: string

  @Field(() => Int)
  commentsIndex?: number

  @Field(() => NoteItemCount)
  count: NoteItemCount

  //@ts-ignore
  created: string
  // @ts-ignore
  modified: string

  hide: boolean

  @Field(() => [ImageRecordModel], { nullable: true })
  public readonly images?: TextImageRecordType[]
  mood?: string
  weather?: string
  @Field(() => Int)
  nid: number
  text: string
  title: string

  @Field(() => [NoteMusicModel], { nullable: true })
  music?: NoteMusicModel[]
}

@ObjectType()
export class NoteItemAggregateModel {
  data: NoteItemModel
  prev?: NoteItemModel
  next?: NoteItemModel
}

@ObjectType()
export class NotePagerModel implements PagerModelImplements {
  data: NoteItemModel[]
  pager: PagerModel
}

@ObjectType()
export class NoteMusicModel implements NoteMusic {
  @Field()
  id: string
  @Field()
  type: string
}
