/*
 * @Author: Innei
 * @Date: 2020-06-06 18:28:53
 * @LastEditTime: 2020-07-12 11:06:06
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/base/dto/pager.dto.ts
 * @Coding with Love
 */

import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'

export class PagerDto {
  @Transform((val) => parseInt(val))
  @Min(1)
  @Max(50)
  @IsInt()
  @ApiProperty({ example: 10 })
  size: number

  @Transform((val) => parseInt(val))
  @Min(1)
  @IsInt()
  @ApiProperty({ example: 1 })
  page: number

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: false })
  select?: string

  @IsOptional()
  @Transform((val) => parseInt(val))
  @Min(1)
  @IsInt()
  @ApiProperty({ example: 2020 })
  year?: number

  @IsOptional()
  @Transform((val) => parseInt(val))
  @IsInt()
  state?: number
}
