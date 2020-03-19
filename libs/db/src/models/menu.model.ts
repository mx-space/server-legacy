import { prop } from '@typegoose/typegoose'
import { Schema } from 'mongoose'

export default class Menu {
  @prop({ unique: true })
  type!: string

  @prop({ trim: true })
  title!: string

  @prop({ default: 0 })
  order?: number

  @prop({ type: Schema.Types.Mixed })
  icon?: any

  @prop({ type: Schema.Types.Mixed })
  options?: any
}
