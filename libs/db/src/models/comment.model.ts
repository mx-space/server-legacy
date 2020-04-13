import { arrayProp, pre, prop, Ref } from '@typegoose/typegoose'
import { BaseModel } from './base.model'
import Post from './post.model'
import Note from './note.model'
import Page from './page.model'

function autoPopulateSubs(next: Function) {
  this.populate('children')
  next()
}

export enum CommentRefTypes {
  Post = 'Post',
  Note = 'Note',
  Page = 'Page',
}

@pre<Comment>('findOne', autoPopulateSubs)
@pre<Comment>('find', autoPopulateSubs)
export default class Comment extends BaseModel {
  @prop({ refPath: 'refType' })
  ref: Ref<Post | Note | Page>

  @prop({ required: true, default: 'Post', enum: CommentRefTypes })
  refType: string

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
  state?: number

  // @prop({ default: false })
  // hasParent?: boolean
  //
  @prop({ ref: 'Comment' })
  parent?: Ref<this>

  @arrayProp({ itemsRef: 'Comment' })
  children?: Ref<this>[]

  @prop({ default: 1 })
  commentsIndex?: number
  @prop()
  key?: string
  @prop({ select: false })
  ip?: string

  @prop({ select: false })
  agent?: string

  @prop({
    ref: 'Post',
    foreignField: '_id',
    localField: 'ref',
    justOne: true,
  })
  public post: Ref<Post>

  @prop({
    ref: 'Note',
    foreignField: '_id',
    localField: 'ref',
    justOne: true,
  })
  public note: Ref<Note>

  @prop({
    ref: 'Page',
    foreignField: '_id',
    localField: 'ref',
    justOne: true,
  })
  public page: Ref<Page>
}
