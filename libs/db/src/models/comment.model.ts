import { arrayProp, pre, prop, Ref } from '@typegoose/typegoose'
import { BaseModel } from './base.model'
import Post from './post.model'

function autoPopulateSubs(next: Function) {
  this.populate('children')
  next()
}

@pre<Comment>('findOne', autoPopulateSubs)
@pre<Comment>('find', autoPopulateSubs)
export default class Comment extends BaseModel {
  @prop({ ref: 'Post', required: true })
  pid!: Ref<Post>

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
}
