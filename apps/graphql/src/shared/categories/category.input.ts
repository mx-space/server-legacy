import { UnprocessableEntityException } from '@nestjs/common'
import { ArgsType, Field, ObjectType, registerEnumType } from '@nestjs/graphql'
import { IsBooleanOrString } from 'apps/server/src/common/validator-decorators/isBooleanOrString'
/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2021-01-15 14:27:12
 * @LastEditors: Innei
 * @FilePath: /server/apps/graphql/src/shared/categories/category.input.ts
 * @MIT
 */
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
import { CategoryItemModel } from '../../graphql/models/category.model'

export enum CategoryType {
  Category,
  Tag,
}

@ArgsType()
export class CategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEnum(CategoryType)
  @IsOptional()
  @Field(() => CategoryType, { nullable: true })
  type?: CategoryType

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  slug?: string
}
@ArgsType()
export class SlugArgsDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  slug?: string
}

@ArgsType()
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
  @Field(() => [Boolean, String])
  tag?: boolean | string
}
@ArgsType()
export class MultiCategoriesArgsDto {
  @IsOptional()
  @IsMongoId({
    each: true,
    message: '多分类查询使用逗号分隔, 应为 mongoID',
  })
  @Transform(({ value: v }) => uniq(v.split(',')))
  @Field(() => [String], { nullable: true })
  ids?: Array<string>

  @IsOptional()
  @IsBoolean()
  @Transform((b) => Boolean(b))
  joint?: boolean

  @IsOptional()
  @Transform(({ value: val }: { value: string }) => {
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
  @Field(() => CategoryType)
  type?: CategoryType
}

@ObjectType()
export class CategoryPagerModel {
  @Field(() => [CategoryItemModel], { nullable: true })
  data: CategoryItemModel[]

  // pager: PagerModel
}

registerEnumType(CategoryType, { name: 'CategoryType' })
