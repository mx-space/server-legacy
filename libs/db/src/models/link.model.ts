/*
 * @Author: Innei
 * @Date: 2020-04-29 12:36:28
 * @LastEditTime: 2021-01-17 21:11:09
 * @LastEditors: Innei
 * @FilePath: /server/libs/db/src/models/link.model.ts
 * @Coding with Love
 */

import { BaseModel } from './base.model'
import { prop } from '@typegoose/typegoose'
import {
  IsUrl,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsEmail,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { range } from 'lodash'

export enum LinkType {
  Friend,
  Collection,
}

export enum LinkState {
  Pass,
  Audit,
}
/**
 * Link Model also used to valid dto
 */
export class Link extends BaseModel {
  @prop({ required: true, trim: true, unique: true })
  @IsString()
  /**
   * name is site name
   */
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

  @IsOptional()
  @IsBoolean()
  @prop({ default: LinkState.Pass })
  state: LinkState

  @prop()
  @IsEmail()
  email?: string
  get hide() {
    return this.state === LinkState.Audit
  }
}
