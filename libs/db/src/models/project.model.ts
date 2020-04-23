import { prop, arrayProp } from '@typegoose/typegoose'
import { IsUrl, IsOptional, IsString } from 'class-validator'
import { BaseModel } from '@libs/db/models/base.model'

export class Project extends BaseModel {
  @prop({ required: true, unique: true })
  name: string

  @prop()
  @IsUrl({ require_protocol: true }, { message: '请更正为正确的网址' })
  @IsOptional()
  previewUrl?: string

  @prop()
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: '请更正为正确的网址' })
  docUrl?: string

  @prop()
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: '请更正为正确的网址' })
  projectUrl?: string

  @arrayProp({ items: String })
  images?: string[]

  @prop({ required: true })
  description: string

  @prop()
  @IsUrl({ require_protocol: true }, { message: '请更正为正确的网址' })
  @IsOptional()
  avatar?: string

  @prop()
  @IsString()
  text: string
}
