import { UnprocessableEntityException } from '@nestjs/common'
/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2021-01-15 13:59:11
 * @LastEditors: Innei
 * @FilePath: /server/apps/server/src/shared/categories/dto/category.dto.ts
 * @MIT
 */
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { uniq } from 'lodash'
import { IsBooleanOrString } from 'apps/server/src/common/validator-decorators/isBooleanOrString'

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

export class MultiQueryTagAndCategoryDto {
  @IsOptional()
  @Transform(({ value: val }) => {
    if (val === '1' || val === 'true') {
      return true
    } else {
      return val
    }
  })
  @IsBooleanOrString()
  tag?: boolean | string
}
export class MultiCategoriesQueryDto {
  @IsOptional()
  @IsMongoId({
    each: true,
    message: '多分类查询使用逗号分隔, 应为 mongoID',
  })
  @Transform(({ value: v }) => uniq(v.split(',')))
  ids?: Array<string>

  @IsOptional()
  @IsBoolean()
  @Transform((b) => Boolean(b))
  @ApiProperty({ enum: [1, 0] })
  joint?: boolean

  @IsOptional()
  @Transform(({ value: v }: { value: string }) => {
    if (typeof v !== 'string') {
      throw new UnprocessableEntityException('type must be a string')
    }
    switch (v.toLowerCase()) {
      case 'category':
        return CategoryType.Category
      case 'tag':
        return CategoryType.Tag
      default:
        return CategoryType.Category
    }
  })
  type: CategoryType
}
