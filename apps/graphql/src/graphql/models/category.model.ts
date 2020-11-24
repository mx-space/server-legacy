/*
 * @Author: Innei
 * @Date: 2020-10-01 14:46:37
 * @LastEditTime: 2020-10-02 13:31:29
 * @LastEditors: Innei
 * @FilePath: /mx-server-next/src/graphql/models/category.model.ts
 * @Mark: Coding with Love
 */
import Category, { CategoryType } from '@libs/db/models/category.model'
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'
import { BaseGLModel } from './base.model'
import { PostItemModel } from './post.model'

registerEnumType(CategoryType, {
  name: 'CategoryType_',
})

@ObjectType()
export class CategoryItemModel extends BaseGLModel implements Category {
  name: string
  slug: string

  @Field(() => CategoryType)
  type: CategoryType

  @Field(() => [PostItemModel], { nullable: true })
  children?: PostItemModel[]
}
