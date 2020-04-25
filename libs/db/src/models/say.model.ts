import { BaseModel } from '@libs/db/models/base.model'
import { prop } from '@typegoose/typegoose'
import { IsOptional, IsString } from 'class-validator'

export class Say extends BaseModel {
  @prop({ required: true })
  @IsString()
  text: string

  @prop()
  @IsString()
  @IsOptional()
  source: string

  @prop()
  @IsString()
  @IsOptional()
  author: string
}
