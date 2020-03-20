import { prop, modelOptions } from '@typegoose/typegoose'
import { Schema } from 'mongoose'

@modelOptions({
  schemaOptions: {
    timestamps: {
      createdAt: 'created',
      updatedAt: 'modified',
    },
  },
})
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
