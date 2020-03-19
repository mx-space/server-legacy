import { prop, Ref, arrayProp } from '@typegoose/typegoose'
import Post from './post.model'

export default class Comment {
  @prop({ ref: Post })
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

  @prop({ default: new Date() })
  created?: Date

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
