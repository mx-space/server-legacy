import { prop, index, modelOptions } from '@typegoose/typegoose'
import { Schema } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'

@index({ created: -1 })
@index({ slug: 1 })
@index({ modified: -1 })
@index({ created: -1, modified: -1 })
@modelOptions({
  schemaOptions: {
    timestamps: {
      updatedAt: 'modified',
      createdAt: 'created',
    },
  },
})
export default class Post {
  @ApiProperty({ description: 'Title' })
  @prop({ trim: true, index: true })
  title!: string

  @ApiProperty({ description: 'Slug' })
  @prop({ trim: true, unique: true })
  slug!: string

  @ApiProperty({ description: 'Text Body' })
  @prop({ trim: true })
  text?: string

  @ApiProperty({ description: '(Optional): Summary' })
  @prop()
  summary?: string

  // @prop()
  // categoryId?:

  // @prop({ default: new Date() })
  // created?: Date
  //
  // @prop({ default: new Date() })
  // modified?: Date

  @ApiProperty({ description: 'Hide?' })
  @prop({ default: false })
  hide?: boolean

  @ApiProperty({ description: 'Display Order' })
  @prop({ default: 0 })
  commentsIndex?: number

  @ApiProperty({ description: 'Other Options' })
  @prop({ type: Schema.Types.Mixed })
  options?: any
}
