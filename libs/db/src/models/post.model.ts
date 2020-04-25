import Category from '@libs/db/models/category.model'
import { index, prop, Ref } from '@typegoose/typegoose'
import { Schema } from 'mongoose'
import { BaseCommentIndexModel } from './base.model'

@index({ created: -1 })
@index({ slug: 1 })
@index({ modified: -1 })
@index({ created: -1, modified: -1 })
@index({ text: 'text' })
export default class Post extends BaseCommentIndexModel {
  @prop({ trim: true, index: true, required: true })
  title!: string

  @prop({ trim: true, unique: true, required: true })
  slug!: string

  @prop({ trim: true, index: true })
  text?: string

  @prop()
  summary?: string

  @prop({ ref: 'Category', required: true })
  categoryId: Ref<Category>

  @prop({
    ref: 'Category',
    foreignField: '_id',
    localField: 'categoryId',
    justOne: true,
  })
  public category: Ref<Category>

  @prop({ default: false })
  hide?: boolean

  @prop({ type: Schema.Types.Mixed })
  options?: Record<any, any>
}
