import { modelOptions, plugin, prop } from '@typegoose/typegoose'
import * as uniqueValidator from 'mongoose-unique-validator'
@plugin(uniqueValidator)
@modelOptions({
  schemaOptions: {
    timestamps: {
      createdAt: 'created',
      updatedAt: 'modified',
    },
    toJSON: {
      versionKey: false,
      virtuals: true,
    },
    toObject: {
      versionKey: false,
      virtuals: true,
    },
  },
})
export abstract class BaseModel {
  @prop()
  created: Date
  @prop()
  modified: Date
}
