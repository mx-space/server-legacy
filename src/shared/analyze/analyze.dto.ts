import { IsOptional, IsDate } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class AnalyzeDto {
  @Transform((v) => new Date(parseInt(v)))
  @IsOptional()
  @IsDate()
  @ApiProperty({ type: 'string' })
  from?: Date

  @Transform((v) => new Date(parseInt(v)))
  @IsOptional()
  @IsDate()
  @ApiProperty({ type: 'string' })
  to?: Date
}
