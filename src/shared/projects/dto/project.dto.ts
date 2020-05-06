import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator'

export class ProjectDto {
  @ApiProperty()
  @IsString()
  name: string

  @IsUrl({ require_protocol: true }, { message: '请更正为正确的网址' })
  @IsOptional()
  @ApiProperty({
    description: '预览地址',
    required: false,
    example: 'http://example.com/image',
  })
  previewUrl?: string

  @IsOptional()
  @ApiProperty({
    description: '文档地址',
    required: false,
    example: 'http://example.com/image',
  })
  @IsUrl({ require_protocol: true }, { message: '请更正为正确的网址' })
  docUrl?: string

  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: '请更正为正确的网址' })
  @ApiProperty({
    description: '项目地址',
    required: false,
    example: 'http://example.com/image',
  })
  projectUrl?: string

  @ApiProperty({
    description: '预览图片地址',
    required: true,
    example: ['http://example.com/image'],
  })
  @IsUrl({ require_protocol: true }, { each: true })
  images?: string[]

  @ApiProperty({ description: '描述', example: '这是一段描述' })
  @IsString()
  description: string

  @IsUrl({ require_protocol: true }, { message: '请更正为正确的网址' })
  @IsOptional()
  @ApiProperty({
    description: '头像地址',
    example: 'http://example.com/image',
    required: false,
  })
  avatar?: string

  @IsString()
  @ApiProperty()
  text: string
}
