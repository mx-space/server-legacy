/*
 * @Author: Innei
 * @Date: 2020-04-26 11:19:25
 * @LastEditTime: 2020-05-26 12:37:19
 * @LastEditors: Innei
 * @FilePath: /mx-server/libs/db/src/models/user.model.ts
 * @Copyright
 */

import { DocumentType, prop } from '@typegoose/typegoose'
import { hashSync } from 'bcrypt'
import { Schema } from 'mongoose'
import { BaseModel } from './base.model'

export type UserDocument = DocumentType<User>

export class TokenModel {
  @prop()
  created: Date

  @prop()
  token: string

  @prop()
  expired?: Date
}

export class User extends BaseModel {
  @prop({ required: true, unique: true, trim: true })
  username!: string

  @prop({ trim: true })
  name!: string

  @prop()
  introduce?: string

  @prop()
  avatar?: string

  @prop({
    select: false,
    get(val) {
      return val
    },
    set(val) {
      return hashSync(val, 6)
    },
    required: true,
  })
  password!: string

  @prop()
  mail?: string

  @prop()
  url?: string

  @prop()
  lastLoginTime?: Date

  @prop({ select: false })
  lastLoginIp?: string

  @prop({ type: Schema.Types.Mixed })
  socialIds?: any

  @prop({ select: true, required: true })
  authCode!: string

  @prop({ items: TokenModel, select: false })
  apiToken?: TokenModel[]
}
