import { modelOptions, prop } from '@typegoose/typegoose'
import { SchemaTypes, Types } from 'mongoose'
import { BaseModel } from './base.model'

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
  ua: IUAParser.IResult

  @prop()
  path?: string

  timestamp: Date
}
