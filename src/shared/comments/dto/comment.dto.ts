import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator'

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
  @ApiProperty({ example: 'example.com' })
  url: string
}
