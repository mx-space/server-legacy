import {
  IsUrl,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsArray,
} from 'class-validator'

export class SEODto {
  @IsString({ message: '标题必须是字符串' })
  @IsNotEmpty({ message: '不能为空!!' })
  @IsOptional()
  title: string

  @IsString({ message: '描述信息必须是字符串' })
  @IsNotEmpty({ message: '不能为空!!' })
  @IsOptional()
  description: string

  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: '站点图标必须为正确的网址' })
  icon?: string

  @IsArray({ each: true, message: '关键字必须为一个数组' })
  @IsOptional()
  keywords?: string[]
}
