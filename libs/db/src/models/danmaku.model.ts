/*
 * @Author: Innei
 * @Date: 2020-05-23 20:00:38
 * @LastEditTime: 2020-05-23 20:05:00
 * @LastEditors: Innei
 * @FilePath: /mx-server/libs/db/src/models/danmaku.model.ts
 * @MIT
 */

import { prop } from '@typegoose/typegoose'
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsRgbColor,
} from 'class-validator'

export class Danmaku {
  @prop()
  @IsString()
  @IsNotEmpty()
  content: string

  @prop()
  @IsString()
  @IsNotEmpty()
  path: string

  @prop()
  @IsInt()
  @Min(5)
  duringTime: number

  @prop()
  @IsOptional()
  @IsRgbColor()
  color?: string

  @prop()
  @IsInt()
  @Min(0)
  startTime?: number
}
