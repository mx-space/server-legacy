import { UnprocessableEntityException } from '@nestjs/common'
/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-08-02 16:22:02
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/categories/dto/category.dto.ts
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
import { IsBooleanOrString } from 'apps/server/src/common/decorators/isBooleanOrString'

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
  @Transform((val) => {
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
  @Transform((str) => uniq(str.split(',')))
  ids?: Array<string>

  @IsOptional()
  @IsBoolean()
  @Transform((b) => Boolean(b))
  @ApiProperty({ enum: [1, 0] })
  joint?: boolean

  @IsOptional()
  @Transform((val: string) => {
    if (typeof val !== 'string') {
      throw new UnprocessableEntityException('type must be a string')
    }
    switch (val.toLowerCase()) {
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
