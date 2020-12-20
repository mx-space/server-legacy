import { prop } from '@typegoose/typegoose'
import { SchemaTypes } from 'mongoose'
import { BaseModel } from './base.model'

export class Recently extends BaseModel {
  @prop({ required: true })
  content: string

  @prop({ type: SchemaTypes.Mixed })
  meta?: Record<string, string>
}
