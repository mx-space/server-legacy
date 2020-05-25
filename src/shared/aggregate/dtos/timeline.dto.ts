/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-05-25 14:45:59
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/aggregate/dtos/timeline.dto.ts
 * @Copyright
 */

import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEnum, IsInt, IsOptional } from 'class-validator'

export enum TimelineType {
  Post,
  Note,
}

export class TimelineQueryDto {
  @Transform((val) => Number(val))
  @IsEnum([1, -1])
  @IsOptional()
  @ApiProperty({ enum: [-1, 1] })
  sort?: -1 | 1

  @Transform((val) => Number(val))
  @IsInt()
  @IsOptional()
  year?: number

  @IsEnum(TimelineType)
  @IsOptional()
  @ApiProperty({ enum: [0, 1] })
  @Transform((v) => ~~v)
  type?: TimelineType
}
