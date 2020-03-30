import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEnum, IsInt } from 'class-validator'

export class StateQueryDto {
  @Transform((val) => parseInt(val))
  @IsInt()
  @IsEnum([0, 1, 2])
  @ApiProperty()
  state: number
}
