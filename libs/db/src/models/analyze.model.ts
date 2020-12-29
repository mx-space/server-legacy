import { modelOptions, prop } from '@typegoose/typegoose'
import { SchemaTypes } from 'mongoose'
import { BaseModel } from './base.model'
import { UAParser } from 'ua-parser-js'
@modelOptions({
  schemaOptions: {
    timestamps: {
      createdAt: 'timestamp',
      updatedAt: false,
    },
  },
})
export class Analyze extends BaseModel {
  @prop()
  ip?: string

  @prop({ type: SchemaTypes.Mixed })
  ua: UAParser

  @prop()
  path?: string

  timestamp: Date
}
