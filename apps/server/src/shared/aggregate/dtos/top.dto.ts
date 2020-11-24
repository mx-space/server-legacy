import { Transform } from 'class-transformer'
import { IsOptional, Max, Min } from 'class-validator'

export class TopQueryDto {
  @Transform((val) => parseInt(val))
  @Min(1)
  @Max(10)
  @IsOptional()
  size?: number
}
