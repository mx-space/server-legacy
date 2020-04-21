import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt } from 'class-validator'

export class StateDto {
  @IsInt()
  @IsEnum([0, 1, 2])
  @ApiProperty()
  state: number
}
