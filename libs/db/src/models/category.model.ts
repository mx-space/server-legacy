import { prop, index, modelOptions } from '@typegoose/typegoose'

@index({ created: -1 })
@index({ count: -1 })
@index({ slug: -1 })
@modelOptions({
  schemaOptions: {
    timestamps: {
      updatedAt: 'modified',
      createdAt: 'created',
    },
  },
})
export default class Category {
  @prop({ unique: true, trim: true, required: true })
  name!: string

  @prop({ default: 'Category' })
  type?: string

  @prop({ unique: true, required: true })
  slug!: string

  @prop({ default: true })
  count?: number

  // @prop({ default: new Date() })
  // created?: Date
}
