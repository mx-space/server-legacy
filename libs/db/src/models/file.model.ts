import { prop } from '@typegoose/typegoose'
import { Schema } from 'mongoose'

export interface Dimensions {
  height: number
  width: number
  type: string
}
export class File {
  @prop({ required: true })
  filename: string

  @prop({ required: true })
  name: string

  @prop()
  mime: string

  @prop({ type: Schema.Types.Mixed })
  info?: Record<string, any>

  @prop()
  dimensions?: Dimensions
}

