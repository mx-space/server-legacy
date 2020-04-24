import { prop, index } from '@typegoose/typegoose'
import { Schema } from 'mongoose'

export interface Dimensions {
  height: number
  width: number
  type: string
}

export enum FileType {
  // image
  IMAGE,
  AVATAR,
  BACKGROUND,
  PHOTO,

  // not image
  // MUSIC,
  // VIDEO,
  // FILE,
}
export const getFileType = (type: FileType) => {
  const ft = Object.keys(FileType)
  return ft.splice(ft.length / 2)[type].toLowerCase()
}
export const getEnumFromType = (type: keyof typeof FileType) => {
  return {
    IMAGE: 0,
    AVATAR: 1,
    BACKGROUND: 2,
    PHOTO: 3,
  }[type]
}

@index({ filename: 1 })
@index({ name: 1 })
export class File {
  @prop({ required: true })
  filename: string

  @prop({ required: true })
  name: string

  @prop()
  mime: string

  @prop({ type: Schema.Types.Mixed })
  info?: Record<string, any>

  @prop()
  dimensions?: Dimensions

  @prop({ default: FileType.IMAGE })
  type: number
}
