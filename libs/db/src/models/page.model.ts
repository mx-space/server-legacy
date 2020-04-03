import { ApiProperty } from '@nestjs/swagger'
import { arrayProp, prop } from '@typegoose/typegoose'
import { Schema, Types } from 'mongoose'
import { BaseModel } from './base.model'
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  IsEnum,
  IsArray,
  IsObject,
} from 'class-validator'

export const pageType = ['md', 'html', 'frame']
export interface Message {
  author: string
  text: string
  mail: string
  created: Date
}

export default class Page extends BaseModel {
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
  @IsNotEmpty()
  subtitle?: string

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

  @ApiProperty({ description: '留言', required: false })
  @arrayProp({ items: Schema.Types.Mixed })
  @IsArray()
  @IsOptional()
  messages?: Message[]

  @ApiProperty({ description: 'Other Options', required: false })
  @prop({ type: Schema.Types.Mixed })
  @IsOptional()
  @IsObject()
  options?: Record<string, any>
}
