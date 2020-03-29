import {
  AutoIncrementID,
  AutoIncrementIDOptions,
} from '@typegoose/auto-increment'
import { index, plugin, prop, Ref } from '@typegoose/typegoose'
import { hashSync } from 'bcrypt'
import * as uniqueValidator from 'mongoose-unique-validator'
import { BaseModel } from './base.model'
import { Schema } from 'mongoose'
class Count {
  @prop({ default: 0 })
  read?: number

  @prop({ default: 0 })
  like?: number
}

@plugin<AutoIncrementIDOptions>(AutoIncrementID, {
  field: 'nid',
  startAt: 1,
})
@plugin(uniqueValidator)
@index({ created: -1 })
@index({ modified: -1 })
@index({ created: -1, modified: -1 })
export default class Note extends BaseModel {
  @prop({ index: true, required: false })
  public nid: number

  @prop({ index: true, trim: true, required: true })
  title!: string

  @prop({ trim: true })
  text?: string

  @prop({ default: false })
  hide?: boolean

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
  mood?: string

  @prop()
  weather?: string

  // TODO bugs
  @prop({ type: Schema.Types.Mixed, default: { read: 0, like: 0 } })
  count?: Record<keyof Count, number>
}
