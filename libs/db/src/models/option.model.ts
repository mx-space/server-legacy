import { prop } from '@typegoose/typegoose'
import { Schema } from 'mongoose'

export default class Option {
  @prop({ unique: true, required: true })
  name!: string

  @prop({ type: Schema.Types.Mixed })
  value?: any
}
