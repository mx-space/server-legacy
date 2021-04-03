import { prop } from '@typegoose/typegoose'
import { BaseModel } from './base.model'

export class Recently extends BaseModel {
  @prop({ required: true })
  content: string
  @prop()
  project?: string
  @prop()
  language?: string
}
