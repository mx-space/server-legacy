import { IsOptional, IsNumber, Max, Min, IsEnum } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class Pager {
  @Transform((val) => parseInt(val))
  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiProperty({ required: false, minimum: 1, example: 1 })
  page?: number

  @Transform((val) => parseInt(val))
  @IsOptional()
  @IsNumber()
  @Max(50)
  @Min(1)
  @ApiProperty({ required: false, minimum: 1, maximum: 50, example: 1 })
  size?: number

  @Transform((val) => parseInt(val))
  @IsEnum([0, 1, 2])
  @ApiProperty({ enum: [0, 1, 2] })
  state?: number
}
