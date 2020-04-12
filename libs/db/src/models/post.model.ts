import Category from '@libs/db/models/category.model'
import { ApiProperty } from '@nestjs/swagger'
import { index, prop, Ref } from '@typegoose/typegoose'
import { Schema } from 'mongoose'
import { BaseModel } from './base.model'

@index({ created: -1 })
@index({ slug: 1 })
@index({ modified: -1 })
@index({ created: -1, modified: -1 })
@index({ text: 'text' })
export default class Post extends BaseModel {
  @ApiProperty({ description: 'Title', required: true })
  @prop({ trim: true, index: true, required: true })
  title!: string

  @ApiProperty({ description: 'Slug', required: true })
  @prop({ trim: true, unique: true, required: true })
  slug!: string

  @ApiProperty({ description: 'Text Body' })
  @prop({ trim: true, index: true })
  text?: string

  @ApiProperty({ description: '(Optional): Summary' })
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

  @ApiProperty({ description: 'Hide?' })
  @prop({ default: false })
  hide?: boolean

  @ApiProperty({ description: 'Display Order' })
  @prop({ default: 0 })
  commentsIndex?: number

  @ApiProperty({ description: 'Other Options' })
  @prop({ type: Schema.Types.Mixed })
  options?: Record<any, any>
}
