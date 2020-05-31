/*
 * @Author: Innei
 * @Date: 2020-05-31 16:10:03
 * @LastEditTime: 2020-05-31 16:10:05
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/utils/pic.ts
 * @Coding with Love
 */

import { HttpService } from '@nestjs/common'
import { imageSize } from 'image-size'

export const pickImagesFromMarkdown = (text: string) => {
  const reg = /(?<=\!\[.*\]\()(.+)(?=\))/g
  const images = [] as string[]
  for (const r of text.matchAll(reg)) {
    images.push(r[0])
  }
  return images
}

export const getOnlineImageSize = async (http: HttpService, image: string) => {
  const { data } = await http
    .get(image, {
      responseType: 'arraybuffer',
    })
    .toPromise()
  const buffer = Buffer.from(data)
  const size = imageSize(buffer)
  return size
}
