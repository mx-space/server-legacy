import { IsEnum, IsOptional, Min, Max, IsInt } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { FileType } from '@libs/db/models/file.model'
import { Transform } from 'class-transformer'

export const RandomType = ['POST', 'NOTE', 'SAY', 'IMAGE']
export type RandomType = 'POST' | 'NOTE' | 'SAY' | 'IMAGE'

export class RandomTypeDto {
  @IsEnum(RandomType)
  @ApiProperty({ enum: RandomType })
  type: RandomType

  @Transform((val) => Number(val))
  @IsOptional()
  @IsEnum(FileType)
  @ApiProperty({ enum: Object.keys(FileType) })
  imageType?: FileType

  @Transform((val) => Number(val))
  @Min(1)
  @Max(10)
  @IsInt()
  @IsOptional()
  size?: number
}
