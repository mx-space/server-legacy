import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CategoryAndSlug {
  @ApiProperty({
    enum: ['programming', 'Z-Turn'],
  })
  @IsString()
  readonly category: string

  @IsString()
  @ApiProperty({ enum: ['why-winserver', 'learning-from-AS'] })
  readonly slug: string
}
