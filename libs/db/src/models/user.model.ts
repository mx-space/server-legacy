import { prop, arrayProp } from '@typegoose/typegoose'
import { hashSync } from 'bcrypt'
export class User {
  @prop({ required: true, unique: true, trim: true })
  username!: string

  @prop({ trim: true })
  name!: string

  @prop({
    select: false,
    set(val) {
      return hashSync(val, 6)
    },
  })
  password!: string

  @prop()
  mail?: string

  @prop()
  url?: string

  @prop({ default: new Date() })
  created?: Date

  @prop()
  lastLoginTime?: Date

  @prop()
  lastLoginIp?: string

  @prop({ select: true })
  authCode!: string

  @arrayProp({ items: String, select: false })
  apiToken?: string[]
}
