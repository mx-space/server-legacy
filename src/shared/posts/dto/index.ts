import { ApiProperty } from '@nestjs/swagger'

export class CategoryAndSlug {
  @ApiProperty()
  readonly category: string

  @ApiProperty()
  readonly slug: string
}
