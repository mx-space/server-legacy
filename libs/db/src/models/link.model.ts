import { BaseModel } from './base.model'
import { prop } from '@typegoose/typegoose'
import { IsUrl, IsString, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { range } from 'lodash'

export enum LinkType {
  Friend,
  Collection,
}

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
  avatar?: string

  @IsOptional()
  @IsString()
  @prop({ trim: true })
  description?: string

  @IsOptional()
  @IsEnum(LinkType)
  @ApiProperty({ enum: range(0, 1) })
  @prop({ default: LinkType.Friend })
  type?: LinkType
}
