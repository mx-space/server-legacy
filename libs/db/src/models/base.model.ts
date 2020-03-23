import { modelOptions, plugin } from '@typegoose/typegoose'
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
    },
  },
})
export abstract class BaseModel {}
