import { Transform, Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

export class MetaDto {
  @IsString()
  title: string

  @Transform((d) => new Date(d))
  @IsDate()
  date: Date

  @Transform((d) => new Date(d))
  @IsDate()
  @IsOptional()
  updated?: Date

  @IsString({ each: true })
  @IsOptional()
  categories?: Array<string>

  @IsString({ each: true })
  @IsOptional()
  tags?: string[]

  @IsString()
  slug: string
}

export class DatatypeDto {
  @ValidateNested()
  @IsOptional()
  @Type(() => MetaDto)
  meta: MetaDto

  @IsString()
  text: string
}

export enum ArticleType {
  Post,
  Note,
}

export class DataListDto {
  @IsEnum(ArticleType)
  type: ArticleType
  @ValidateNested({ each: true })
  @Type(() => DatatypeDto)
  data: DatatypeDto[]
}
