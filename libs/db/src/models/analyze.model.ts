import { prop, modelOptions } from '@typegoose/typegoose'

@modelOptions({
  schemaOptions: {
    timestamps: {
      createdAt: 'timestamp',
      updatedAt: false,
    },
  },
})
export class Analyze {
  @prop()
  ip?: string

  @prop()
  ua: IUAParser.IResult
}
