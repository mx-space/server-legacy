import { BaseModel } from './base.model'
import { prop } from '@typegoose/typegoose'
import { IsUrl, IsString, IsOptional } from 'class-validator'

export class Link extends BaseModel {
  @prop({ required: true, trim: true, unique: true })
  @IsString()
  name: string

  @prop({ required: true, trim: true, unique: true })
  @IsUrl({ require_protocol: true })
  url: string

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @prop({ trim: true })
  avatar: string
}
