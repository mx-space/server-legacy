import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
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
  @IsNotEmpty()
  title: string

  @ApiProperty({ example: 'this is text.' })
  @IsString()
  @IsNotEmpty()
  text: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
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
  @IsNotEmpty()
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
