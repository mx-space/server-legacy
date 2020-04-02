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
}
