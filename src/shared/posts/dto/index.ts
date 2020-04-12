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
  @ApiProperty({ example: 'Z-Turn' })
  @IsString()
  readonly category: string

  @IsString()
  @ApiProperty({ example: 'why-winserver' })
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
    example: '5e6f67e75b303781d2807278',
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
  @IsNotEmptyObject()
  @ApiProperty({ required: false, type: Object })
  options?: Record<any, any>
}
