import { ApiProperty } from '@nestjs/swagger'
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsMongoId,
  IsBooleanString,
  IsBoolean,
  ValidateIf,
  isDefined,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { uniq } from 'lodash'

export enum CategoryType {
  Category,
  Tag,
}

export class CategoryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string

  @IsEnum(CategoryType)
  @IsOptional()
  @ApiProperty({ enum: [0, 1] })
  type?: CategoryType

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  slug?: string
}

export class SlugOrIdDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  query?: string
}

export class MultiCategoriesQueryDto {
  @IsOptional()
  @IsMongoId({
    each: true,
    message: '多分类查询使用逗号分隔, 应为 mongoID',
  })
  @Transform((str) => uniq(str.split(',')))
  ids?: Array<string>

  @IsOptional()
  @IsBoolean()
  @Transform((b) => Boolean(b))
  @ApiProperty({ enum: [1, 0] })
  joint?: boolean
}
