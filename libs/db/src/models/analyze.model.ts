import { prop } from '@typegoose/typegoose'
import { BaseModel } from './base.model'

export class Analyze extends BaseModel {
  @prop()
  ip?: string

  @prop()
  ua: IUAParser.IResult
}
