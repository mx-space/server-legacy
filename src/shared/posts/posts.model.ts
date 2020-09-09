/*
 * @Author: Innei
 * @Date: 2020-09-09 13:46:27
 * @LastEditTime: 2020-09-09 13:51:44
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/posts/posts.schema.ts
 * @Mark: Coding with Love
 */
import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class PostItemModel {
  @Field(() => ID)
  public readonly _id: string

  public readonly title: string
  public readonly text: string
}
