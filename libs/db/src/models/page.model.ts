import { prop, modelOptions } from '@typegoose/typegoose'
import { ApiProperty } from '@nestjs/swagger'
import { Schema } from 'mongoose'

@modelOptions({
  schemaOptions: {
    timestamps: {
      updatedAt: 'modified',
      createdAt: 'created',
    },
  },
})
export default class Page {
  @ApiProperty({ description: 'Slug' })
  @prop({ trim: 1, index: true })
  slug!: string

  @ApiProperty({ description: 'Title' })
  @prop({ trim: true })
  title!: string

  @ApiProperty({ description: 'SubTitle' })
  @prop({ trim: true })
  subtitle!: string

  @ApiProperty({ description: 'Order' })
  @prop({ default: 1 })
  order!: number

  @ApiProperty({ description: 'Text' })
  @prop()
  text!: string

  @ApiProperty({ description: 'Type (MD | html | frame)' })
  @prop({ default: 'md' })
  type?: string

  @ApiProperty({ description: 'Other Options' })
  @prop({ type: Schema.Types.Mixed })
  options?: any
}
