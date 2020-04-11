import { prop, arrayProp } from '@typegoose/typegoose'
import { IsUrl, IsOptional, IsString } from 'class-validator'
import { BaseModel } from '@libs/db/models/base.model'

export class Project extends BaseModel {
  @prop({ required: true, unique: true })
  name: string

  @prop()
  @IsUrl()
  @IsOptional()
  previewUrl?: string

  @prop()
  @IsOptional()
  @IsUrl()
  docUrl?: string

  @prop()
  @IsOptional()
  @IsUrl()
  projectUrl?: string

  @arrayProp({ items: String })
  images?: string[]

  @prop({ required: true })
  description: string

  @prop()
  @IsUrl()
  @IsOptional()
  avatar?: string

  @prop()
  @IsString()
  text: string
}
