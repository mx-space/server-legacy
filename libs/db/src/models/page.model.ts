import { ApiProperty } from '@nestjs/swagger'
import { modelOptions, prop, plugin } from '@typegoose/typegoose'
import { Schema } from 'mongoose'
import * as uniqueValidator from 'mongoose-unique-validator'

@plugin(uniqueValidator)
@modelOptions({
  schemaOptions: {
    timestamps: {
      updatedAt: 'modified',
      createdAt: 'created',
    },
  },
})
export default class Page {
  @ApiProperty({ description: 'Slug', required: true })
  @prop({ trim: 1, index: true, required: true })
  slug!: string

  @ApiProperty({ description: 'Title', required: true })
  @prop({ trim: true, required: true })
  title!: string

  @ApiProperty({ description: 'SubTitle' })
  @prop({ trim: true })
  subtitle?: string

  @ApiProperty({ description: 'Order' })
  @prop({ default: 1 })
  order!: number

  @ApiProperty({ description: 'Text', required: true })
  @prop({ required: true })
  text!: string

  @ApiProperty({ description: 'Type (MD | html | frame)' })
  @prop({ default: 'md' })
  type?: string

  @ApiProperty({ description: 'Other Options' })
  @prop({ type: Schema.Types.Mixed })
  options?: any
}
