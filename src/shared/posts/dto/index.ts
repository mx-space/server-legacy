/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-09-09 15:05:08
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/posts/dto/index.ts
 * @MIT
 */
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { InputType, Field, ArgsType } from '@nestjs/graphql'
import {
  ArrayUnique,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator'
import { PagerDto } from '../../base/dto/pager.dto'

export class CategoryAndSlug {
  @ApiProperty({ example: 'Z-Turn' })
  @IsString()
  readonly category: string

  @IsString()
  @ApiProperty({ example: 'why-winserver' })
  @Transform((v) => decodeURI(v))
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
  @MaxLength(150, { message: '总结的字数不得大于 150 个字符哦' })
  summary: string

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: false })
  hide: boolean

  @IsBoolean()
  @IsOptional()
  copyright?: boolean

  @IsOptional()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  @ArrayUnique()
  tags: string[]

  @IsOptional()
  @IsNotEmptyObject()
  options?: Record<any, any>
}

export class PostPaginationQueryDto extends PagerDto {
  @IsOptional()
  @IsEnum(['categoryId', 'title', 'created', 'modified'])
  @Transform((v) => (v === 'category' ? 'categoryId' : v))
  @Field()
  sortBy?: string

  @IsOptional()
  @IsEnum([1, -1])
  @ValidateIf((o) => o.sortBy)
  @Transform((v) => ~~v)
  @Field()
  sortOrder?: 1 | -1
}

@ArgsType()
export class PostPaginationArgs extends PostPaginationQueryDto {}
