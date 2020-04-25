import { IsEnum, IsOptional, Min, Max, IsInt } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { FileType } from '@libs/db/models/file.model'
import { Transform } from 'class-transformer'
import { range } from 'lodash'

// export const RandomType = ['POST', 'NOTE', 'SAY', 'IMAGE']
export enum RandomType {
  POST,
  NOTE,
  SAY,
  IMAGE,
}

export class RandomTypeDto {
  @Transform((val) => Number(val))
  @IsEnum(RandomType)
  @ApiProperty({
    enum: range(4),
    description: '0 - POST, 1 - NOTE, 2 - SAY, 3 - IMAGE',
  })
  type: RandomType

  @Transform((val) => Number(val))
  @IsOptional()
  @IsEnum(FileType)
  @ApiProperty({
    enum: range(3),
    description: '0 - IMAGE, 1 - AVATAR, 2 - BACKGROUND, 3 - PHOTO',
  })
  imageType?: FileType

  @Transform((val) => Number(val))
  @Min(1)
  @Max(10)
  @IsInt()
  @IsOptional()
  size?: number
}
