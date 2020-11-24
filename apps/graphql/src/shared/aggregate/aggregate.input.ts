/*
 * @Author: Innei
 * @Date: 2020-10-04 09:15:23
 * @LastEditTime: 2020-10-04 09:19:55
 * @LastEditors: Innei
 * @FilePath: /mx-server-next/src/shared/aggregate/aggregate.input.ts
 * @Mark: Coding with Love
 */
import { ArgsType, Field, Int } from '@nestjs/graphql'
import { IsEnum, IsInt, IsOptional } from 'class-validator'
import { SortOrder } from '../../graphql/args/id.input'

@ArgsType()
export class TimelineArgsDto {
  @IsEnum(SortOrder)
  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  sort?: number

  @IsInt()
  @IsOptional()
  year?: number
}
