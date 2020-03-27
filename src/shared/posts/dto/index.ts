import { ApiProperty } from '@nestjs/swagger'
import {
  IsMongoId,
  IsOptional,
  IsString,
  IsBoolean,
  IsObject,
  IsNotEmptyObject,
} from 'class-validator'

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

export class PostDto {
  @ApiProperty({ example: 'title' })
  @IsString()
  title: string

  @ApiProperty({ example: 'this is text.' })
  @IsString()
  text: string

  @ApiProperty()
  @IsString()
  slug: string

  @IsMongoId()
  @ApiProperty({
    enum: [
      '5e6f67e75b303781d2807278',
      '5e6f67e75b303781d280727a',
      '5e6f67e75b303781d280727c',
      '5e6f67e75b303781d280727e',
    ],
  })
  categoryId: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  summary: string

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: false })
  hide: boolean

  @IsOptional()
  // @IsObject()
  @IsNotEmptyObject()
  @ApiProperty({ required: false, type: Object })
  options?: Record<any, any>
}
