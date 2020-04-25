import { arrayProp, DocumentType, prop } from '@typegoose/typegoose'
import { hashSync } from 'bcrypt'
import { BaseModel } from './base.model'

export type UserDocument = DocumentType<User>
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

  @prop()
  lastLoginIp?: string

  @prop({ select: true, required: true })
  authCode!: string

  @arrayProp({ items: String, select: false })
  apiToken?: string[]
}
