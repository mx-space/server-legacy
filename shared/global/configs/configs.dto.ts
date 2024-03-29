import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator'

export class SEODto {
  @IsString({ message: '标题必须是字符串' })
  @IsNotEmpty({ message: '不能为空!!' })
  @IsOptional()
  @ApiProperty({ example: '我的小窝' })
  title: string

  @IsString({ message: '描述信息必须是字符串' })
  @IsNotEmpty({ message: '不能为空!!' })
  @IsOptional()
  @ApiProperty({ example: '欢迎来到我的小窝' })
  description: string

  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: '站点图标必须为正确的网址' })
  icon?: string

  @IsString({ message: '关键字必须为一个数组', each: true })
  @IsOptional()
  @ApiProperty({ example: ['blog', 'mx-space'] })
  keywords?: string[]
}

export class UrlDto {
  @IsUrl({ require_protocol: true })
  @IsOptional()
  @ApiProperty({ example: 'http://127.0.0.1:2323' })
  webUrl: string

  @IsUrl({ require_protocol: true })
  @IsOptional()
  @ApiProperty({ example: 'http://127.0.0.1:9528' })
  adminUrl: string

  @IsUrl({ require_protocol: true })
  @IsOptional()
  @ApiProperty({ example: 'http://127.0.0.1:2333' })
  serverUrl: string

  @IsUrl()
  @IsOptional()
  @ApiProperty({ example: 'http://127.0.0.1:8080' })
  wsUrl: string
}
class MailOption {
  @IsInt()
  @Transform(({ value: val }) => parseInt(val))
  port: number
  @IsUrl({ require_protocol: false })
  host: string
}
export class ImageBedDto {
  @IsEnum(['github']) // TODO
  @IsOptional()
  type: 'github'

  @IsOptional()
  @IsString()
  token?: string

  @IsOptional()
  @IsString()
  repo?: string

  @IsOptional()
  @IsUrl({ require_protocol: true })
  customUrl?: string
}

export class MailOptionsDto {
  @IsBoolean()
  @IsOptional()
  enable: boolean
  @IsEmail()
  @IsOptional()
  user: string
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  pass: string

  @ValidateNested()
  @Type(() => MailOption)
  @IsOptional()
  options?: MailOption
}

export class CommentOptions {
  @IsBoolean()
  @IsOptional()
  antiSpam: boolean

  @IsString({ each: true })
  @IsOptional()
  spamKeywords?: string[]

  @IsString({ each: true })
  @IsOptional()
  blockIps?: string[]
  @IsOptional()
  @IsBoolean()
  disableNoChinese?: boolean
}

export class BackupOptions {
  @IsBoolean()
  @IsOptional()
  enable: boolean

  @IsString()
  @IsOptional()
  SecretId?: string

  @IsOptional()
  @IsString()
  SecretKey?: string

  @IsOptional()
  @IsString()
  Bucket?: string

  @IsString()
  @IsOptional()
  Region: string
}

export class BaiduSearchOptions {
  @IsOptional()
  @IsBoolean()
  enable?: boolean

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  token?: string
}
