/*
 * @Author: Innei
 * @Date: 2020-10-02 21:16:33
 * @LastEditTime: 2020-10-02 21:33:53
 * @LastEditors: Innei
 * @FilePath: /mx-server-next/src/graphql/models/master.model.ts
 * @Mark: Coding with Love
 */
import { Field, ID, ObjectType } from '@nestjs/graphql'
import { BaseGLModel } from './base.model'

@ObjectType()
export class MasterModel extends BaseGLModel {
  token: string

  name: string
  username: string
  created: Date
  url?: string
  mail?: string

  avatar?: string
  expiresIn: number

  @Field(() => ID)
  _id: string
}
