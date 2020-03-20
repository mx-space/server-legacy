import { prop, Ref, arrayProp, pre, modelOptions } from '@typegoose/typegoose'
import Post from './post.model'

function autoPopulateSubs(next) {
  this.populate('children')
  next()
}

@pre<Comment>('findOne', autoPopulateSubs)
@pre<Comment>('find', autoPopulateSubs)
@modelOptions({
  schemaOptions: {
    timestamps: {
      updatedAt: 'modified',
      createdAt: 'created',
    },
  },
})
export default class Comment {
  @prop({ ref: 'Post' })
  pid!: Ref<Post>

  @prop({ trim: true })
  author!: string

  @prop({ trim: true })
  mail?: string

  @prop({ trim: true })
  url?: string

  @prop()
  text!: string

  @prop({ default: 0 })
  state?: number

  @prop({ default: false })
  hasParent?: boolean

  @arrayProp({ itemsRef: this })
  children?: Ref<this>[]

  @prop({ default: 0 })
  commetnsIndex?: number
  @prop()
  key?: string
  @prop()
  ip?: string

  @prop()
  agent?: string
}
