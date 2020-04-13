import {
  AutoIncrementID,
  AutoIncrementIDOptions,
} from '@typegoose/auto-increment'
import { index, plugin, prop } from '@typegoose/typegoose'
import { hashSync } from 'bcrypt'
import { Schema } from 'mongoose'
import * as uniqueValidator from 'mongoose-unique-validator'
import { BaseCommentIndexModel } from './base.model'

export enum MoodSet {
  'happy' = '开心',
  'sad' = '伤心',
  'angry' = '生气',
  'sorrow' = '悲哀',
  'pain' = '痛苦',
  'terrible' = '可怕',
  'unhappy' = '不快',
  'detestable' = '可恶',
  'worry' = '担心',
  'despair' = '绝望',
  'anxiety' = '焦虑',
  'excite' = '激动',
}

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
@index({ text: 'text' })
@index({ modified: -1 })
@index({ created: -1, modified: -1 })
export default class Note extends BaseCommentIndexModel {
  @prop({ index: true, required: false })
  public nid: number

  @prop({ index: true, trim: true, required: true })
  title!: string

  @prop({ trim: true, index: true })
  text: string

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

  @prop({ enum: Object.keys(MoodSet) })
  mood?: string

  @prop()
  weather?: string

  // TODO bugs
  @prop({ type: Schema.Types.Mixed, default: { read: 0, like: 0 } })
  count?: Record<keyof Count, number>
}
