import { prop, modelOptions, Severity } from '@typegoose/typegoose'
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

  @prop()
  ua: IUAParser.IResult

  timestamp: Date
}
