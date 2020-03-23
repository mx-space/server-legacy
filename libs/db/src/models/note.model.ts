import { index, modelOptions, plugin, prop, Ref } from '@typegoose/typegoose'
import { hashSync } from 'bcrypt'
import * as uniqueValidator from 'mongoose-unique-validator'
import { BaseModel } from './base.model'

class Count {
  @prop({ default: 0 })
  read?: number

  @prop({ default: 0 })
  like?: number
}

@plugin(uniqueValidator)
@index({ created: -1 })
@index({ slug: 1 })
@index({ modified: -1 })
@index({ created: -1, modified: -1 })
export default class Note extends BaseModel {
  @prop({ index: true, required: true })
  nid!: number

  @prop({ index: true, trim: true, required: true })
  title!: string

  // @prop({ default: new Date() })
  // created?: Date
  //
  // @prop({ default: new Date() })
  // modified?: Date

  @prop({ trim: true, unique: true, required: true })
  slug!: string

  @prop({ trim: true })
  text?: string

  @prop({ default: false })
  hide?: boolean

  @prop({
    get(val) {
      return val
    },
    set(val) {
      return hashSync(val, 4)
    },
  })
  password?: string

  @prop()
  mood?: string

  @prop()
  weather?: string

  // TODO bugs
  @prop({ ref: 'Count' })
  count?: Ref<Count>
}
