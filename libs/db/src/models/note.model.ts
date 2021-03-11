/*
 * @Author: Innei
 * @Date: 2021-01-01 13:25:04
 * @LastEditTime: 2021-03-11 22:13:17
 * @LastEditors: Innei
 * @FilePath: /server/libs/db/src/models/note.model.ts
 * Mark: Coding with Love
 */
import { AutoIncrementID } from '@typegoose/auto-increment'
import { index, modelOptions, plugin, prop } from '@typegoose/typegoose'
import { hashSync } from 'bcrypt'
import * as uniqueValidator from 'mongoose-unique-validator'
import { WriteBaseModel } from './base.model'

export class Count {
  @prop({ default: 0 })
  read?: number

  @prop({ default: 0 })
  like?: number
}

@modelOptions({
  schemaOptions: {
    id: false,
    _id: false,
  },
})
export class NoteMusic {
  @prop({ required: true })
  type: string
  @prop({ required: true })
  id: string
}

@plugin(AutoIncrementID, {
  field: 'nid',
  startAt: 1,
})
@plugin(uniqueValidator)
@index([{ text: 'text' }, { modified: -1 }, { nid: -1 }])
export default class Note extends WriteBaseModel {
  @prop({ required: false, unique: true })
  public nid: number

  @prop({ default: false })
  hide: boolean

  @prop({
    get(val) {
      return val
    },
    set(val) {
      return val ? hashSync(val, 4) : undefined
    },
    select: false,
  })
  password?: string

  @prop()
  secret?: Date

  @prop()
  mood?: string

  @prop()
  weather?: string

  @prop()
  hasMemory?: boolean

  @prop({ type: Count, default: { read: 0, like: 0 }, _id: false })
  count?: Count

  @prop({ type: [NoteMusic] })
  music?: NoteMusic[]
}
