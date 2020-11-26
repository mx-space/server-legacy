/*
 * @Author: Innei
 * @Date: 2020-04-18 19:04:13
 * @LastEditTime: 2020-07-19 14:11:54
 * @LastEditors: Innei
 * @FilePath: /mx-server/libs/db/src/models/comment.model.ts
 * @Copyright
 */

import { pre, prop, Ref } from '@typegoose/typegoose'
import { getAvatar } from 'shared/utils'
import { Types } from 'mongoose'

import { BaseModel } from './base.model'
import Note from './note.model'
import Page from './page.model'
import Post from './post.model'

function autoPopulateSubs(next: () => void) {
  this.populate({ options: { sort: { created: -1 } }, path: 'children' })
  next()
}

export enum CommentRefTypes {
  Post = 'Post',
  Note = 'Note',
  Page = 'Page',
}

export enum CommentState {
  Unread,
  Read,
  Junk,
}

@pre<Comment>('findOne', autoPopulateSubs)
@pre<Comment>('find', autoPopulateSubs)
export default class Comment extends BaseModel {
  @prop({ refPath: 'refType' })
  ref: Ref<Post | Note | Page>

  @prop({ required: true, default: 'Post', enum: CommentRefTypes })
  refType: CommentRefTypes

  @prop({ trim: true, required: true })
  author!: string

  @prop({ trim: true })
  mail?: string

  @prop({ trim: true })
  url?: string

  @prop({ required: true })
  text!: string

  // 0 : 未读
  // 1 : 已读
  // 2 : 垃圾
  @prop({ default: 0 })
  state?: CommentState

  // @prop({ default: false })
  // hasParent?: boolean
  //
  @prop({ ref: () => Comment })
  parent?: Ref<Comment>

  @prop({ ref: () => Comment, type: Types.ObjectId })
  children?: Ref<Comment>[]

  @prop({ default: 1 })
  commentsIndex?: number
  @prop()
  key?: string
  @prop({ select: false })
  ip?: string

  @prop({ select: false })
  agent?: string

  @prop({
    ref: () => Post,
    foreignField: '_id',
    localField: 'ref',
    justOne: true,
  })
  public post: Ref<Post>

  @prop({
    ref: () => Note,
    foreignField: '_id',
    localField: 'ref',
    justOne: true,
  })
  public note: Ref<Note>

  @prop({
    ref: () => Page,
    foreignField: '_id',
    localField: 'ref',
    justOne: true,
  })
  public page: Ref<Page>

  public get avatar() {
    return getAvatar(this.mail)
  }
}
