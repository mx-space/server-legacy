import { prop } from '@typegoose/typegoose'
import { Schema } from 'mongoose'
import { BaseModel } from './base.model'

export default class Menu extends BaseModel {
  @prop({ unique: true, required: true })
  type!: string

  @prop({ trim: true, required: true })
  title!: string

  @prop({ default: 0 })
  order?: number

  @prop({ type: Schema.Types.Mixed })
  icon?: any

  @prop({ type: Schema.Types.Mixed })
  options?: any
}
