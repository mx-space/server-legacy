import { DocumentType, index, prop } from '@typegoose/typegoose'
import { BaseModel } from './base.model'
export type CategoryDocument = DocumentType<Category>

@index({ created: -1 })
@index({ count: -1 })
@index({ slug: -1 })
export default class Category extends BaseModel {
  @prop({ unique: true, trim: true, required: true })
  name!: string

  @prop({ default: 'Category' })
  type?: string

  @prop({ unique: true, required: true })
  slug!: string

  @prop({ default: 0 })
  count?: number
}
