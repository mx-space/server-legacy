import {
  prop,
  arrayProp,
  modelOptions,
  plugin,
  DocumentType,
} from '@typegoose/typegoose'
import { hashSync } from 'bcrypt'
import { ApiProperty } from '@nestjs/swagger'
import * as uniqueValidator from 'mongoose-unique-validator'

export type UserDocument = DocumentType<User>
@plugin(uniqueValidator)
@modelOptions({
  schemaOptions: {
    timestamps: {
      createdAt: 'created',
      updatedAt: 'modified',
    },
  },
})
export class User {
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

  // @prop({ default: new Date() })
  // created?: Date
  //
  @prop()
  lastLoginTime?: Date

  @prop()
  lastLoginIp?: string

  @prop({ select: true, required: true })
  authCode!: string

  @arrayProp({ items: String, select: false })
  apiToken?: string[]
}
