/*
 * @Author: Innei
 * @Date: 2020-10-01 14:42:26
 * @LastEditTime: 2020-10-01 20:53:30
 * @LastEditors: Innei
 * @FilePath: /mx-server-next/src/graphql/models/base.model.ts
 * @Mark: Coding with Love
 */
import { TextImageRecordType } from '@libs/db/models/base.model'
import { Field, ID, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export abstract class BaseGLModel {
  @Field(() => ID)
  public readonly _id!: string

  @Field()
  public readonly created: Date

  @Field()
  public readonly modified: Date
}

@ObjectType()
export class ImageRecordModel implements TextImageRecordType {
  height: number

  width: number

  src: string

  type?: string
}

@ObjectType()
export class BaseTextGLModel extends BaseGLModel {
  title: string

  text: string
}

@ObjectType()
export class TextModelImplementsImageRecordModel extends BaseTextGLModel {
  @Field(() => [ImageRecordModel], { nullable: true })
  images?: ImageRecordModel[]
}

@ObjectType()
export class PostItemCount {
  @Field(() => Int)
  like?: number

  @Field(() => Int)
  read?: number
}

@ObjectType()
export class PagerModel {
  /**
   * 总条数
   */
  @Field(() => Int)
  total: number
  /**
   * 一页多少条
   */
  @Field(() => Int)
  size: number
  /**
   * 当前页
   */
  @Field(() => Int)
  currentPage: number
  /**
   * 总页数
   */
  @Field(() => Int)
  totalPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// export const PagerModelFactory = <T>(classRef: Type<T>): any => {
//   @ObjectType({ isAbstract: true })
//   abstract class PagerDataModel {
//     @Field(() => PagerModel)
//     public pager: PagerModel

//     @Field(type => [classRef], { nullable: true })
//     public data: T[]
//   }

//   return PagerDataModel
// }

export interface PagerModelImplements {
  pager: PagerModel
  data: any
}
