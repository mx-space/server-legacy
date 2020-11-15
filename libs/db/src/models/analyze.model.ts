import { modelOptions, prop } from '@typegoose/typegoose'
import { BaseModel } from './base.model'

@modelOptions({
  schemaOptions: {
    timestamps: {
      createdAt: 'created',
      updatedAt: false,
    },
  },
})
export class Analyze extends BaseModel {
  @prop()
  ip?: string

  @prop()
  ua: IUAParser.IResult

  @prop()
  path?: string
}
