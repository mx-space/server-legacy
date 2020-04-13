import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsEnum,
} from 'class-validator'
import { CommentRefTypes } from '@libs/db/models/comment.model'

export class CommentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  author: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  text: string

  @IsString()
  @IsEmail()
  @ApiProperty({ example: 'test@mail.com' })
  mail: string

  @IsString()
  @IsUrl()
  @IsOptional()
  @ApiProperty({ example: 'example.com' })
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
