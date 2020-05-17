import { ApiProperty } from '@nestjs/swagger'
import { prop } from '@typegoose/typegoose'
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import { Schema } from 'mongoose'
import { BaseCommentIndexModel } from './base.model'
import { IsNilOrString } from '../decorators/isNilOrString'

export const pageType = ['md', 'html', 'frame']
export interface Message {
  author: string
  text: string
  mail: string
  created: Date
}

export default class Page extends BaseCommentIndexModel {
  @ApiProperty({ description: 'Slug', required: true })
  @prop({ trim: 1, index: true, required: true, unique: true })
  @IsString()
  @IsNotEmpty()
  slug!: string

  @ApiProperty({ description: 'Title', required: true })
  @prop({ trim: true, required: true })
  @IsString()
  @IsNotEmpty()
  title!: string

  @ApiProperty({ description: 'SubTitle', required: false })
  @prop({ trim: true })
  @IsString()
  @IsOptional()
  @IsNilOrString()
  subtitle?: string | null

  @ApiProperty({ description: 'Order', required: false })
  @prop({ default: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order!: number

  @ApiProperty({ description: 'Text', required: true })
  @prop({ required: true })
  @IsString()
  @IsNotEmpty()
  text!: string

  @ApiProperty({
    description: 'Type (MD | html | frame)',
    enum: pageType,
    required: false,
  })
  @prop({ default: 'md' })
  @IsEnum(pageType)
  @IsOptional()
  type?: string

  @ApiProperty({ description: 'Other Options', required: false })
  @prop({ type: Schema.Types.Mixed })
  @IsOptional()
  @IsObject()
  options?: Record<string, any>
}
