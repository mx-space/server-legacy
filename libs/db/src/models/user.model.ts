import { ApiProperty } from '@nestjs/swagger'
import { arrayProp, DocumentType, prop } from '@typegoose/typegoose'
import { hashSync } from 'bcrypt'
import { BaseModel } from './base.model'

export type UserDocument = DocumentType<User>
export class User extends BaseModel {
  @prop({ required: true, unique: true, trim: true })
  @ApiProperty({
    description: 'Username',
    example: 'test',
    required: true,
  })
  username!: string

  @prop({ trim: true })
  @ApiProperty({
    description: 'Display name',
  })
  name!: string

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
  @ApiProperty({
    description: 'Password',
    required: true,
  })
  password!: string

  @prop()
  @ApiProperty()
  mail?: string

  @prop()
  @ApiProperty()
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
