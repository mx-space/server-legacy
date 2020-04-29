import { Transform } from 'class-transformer'
import { IsEnum, IsInt, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

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
  type?: TimelineType
}
