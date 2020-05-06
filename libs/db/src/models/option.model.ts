import { prop, modelOptions, Severity } from '@typegoose/typegoose'
import { Schema } from 'mongoose'

@modelOptions({
  options: { allowMixed: Severity.ALLOW },
})
export class Option {
  @prop({ unique: true, required: true })
  name: string

  @prop({ type: Schema.Types.Mixed })
  value: any
}
