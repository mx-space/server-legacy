import {
  modelOptions,
  plugin,
  prop,
  Severity,
  index,
} from '@typegoose/typegoose'
import * as uniqueValidator from 'mongoose-unique-validator'
import * as mongooseLeanVirtuals from 'mongoose-lean-virtuals'
import { IsString, IsNotEmpty } from 'class-validator'
@modelOptions({
  schemaOptions: { _id: false },
})
class Image {
  @prop()
  width?: number
  @prop()
  height?: number
  @prop()
  type?: string
}
@plugin(mongooseLeanVirtuals)
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
  options: { allowMixed: Severity.ALLOW },
})
@index({ created: -1 })
export abstract class BaseModel {
  created: Date
  @prop()
  modified: Date
}

export abstract class BaseCommentIndexModel extends BaseModel {
  @prop({ default: 0 })
  commentsIndex?: number

  @prop({ default: true })
  allowComment: boolean
}

export abstract class WriteBaseModel extends BaseCommentIndexModel {
  @prop({ trim: true, index: true, required: true })
  @IsString()
  @IsNotEmpty()
  title: string

  @prop({ trim: true })
  @IsString()
  text: string

  @prop({ items: Image })
  images?: Image[]
}
