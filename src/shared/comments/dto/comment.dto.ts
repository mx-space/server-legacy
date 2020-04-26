import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsEnum,
  MaxLength,
} from 'class-validator'
import { CommentRefTypes } from '@libs/db/models/comment.model'

export class CommentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @MaxLength(20, { message: '昵称不得大于 20 个字符' })
  author: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @MaxLength(200, { message: '评论内容不得大于 200 个字符' })
  text: string

  @IsString()
  @IsEmail(undefined, { message: '请更正为正确的邮箱' })
  @ApiProperty({ example: 'test@mail.com' })
  @MaxLength(50, { message: '邮箱地址不得大于 50 个字符' })
  mail: string

  @IsString()
  @IsUrl({ require_protocol: true }, { message: '请更正为正确的网址' })
  @IsOptional()
  @ApiProperty({ example: 'http://example.com' })
  @MaxLength(50, { message: '地址不得大于 50 个字符' })
  url?: string
}

export class TextOnlyDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  text: string
}

export class CommentRefTypesDto {
  @IsOptional()
  @IsEnum(CommentRefTypes)
  @ApiProperty({ enum: CommentRefTypes, required: false })
  ref: CommentRefTypes
}
