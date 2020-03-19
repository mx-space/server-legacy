import { prop, index } from '@typegoose/typegoose'

@index({ created: -1 })
@index({ slug: 1 })
@index({ modified: -1 })
@index({ created: -1, modified: -1 })
export default class Post {
  @prop({ trim: true, index: true })
  title!: string

  @prop({ trim: true, unique: true })
  slug!: string

  @prop({ trim: true })
  text?: string

  @prop()
  summary?: string

  // @prop()
  // categoryId?:

  @prop({ default: new Date() })
  created?: Date

  @prop({ default: new Date() })
  modified?: Date

  @prop({ default: false })
  hide?: boolean

  @prop({ default: 0 })
  commentsIndex?: number

  @prop()
  options?: any
}
