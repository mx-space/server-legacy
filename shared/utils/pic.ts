/*
 * @Author: Innei
 * @Date: 2020-05-31 16:10:03
 * @LastEditTime: 2020-05-31 16:10:05
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/utils/pic.ts
 * @Coding with Love
 */

import { createCanvas, loadImage } from 'canvas'
import { ISizeCalculationResult } from 'image-size/dist/types/interface'

export const pickImagesFromMarkdown = (text: string) => {
  const reg = /(?<=\!\[.*\]\()(.+)(?=\))/g
  const images = [] as string[]
  for (const r of text.matchAll(reg)) {
    images.push(r[0])
  }
  return images
}

export async function getAverageRGB(
  buffer: Buffer,
  size: ISizeCalculationResult,
): Promise<string | undefined> {
  if (!buffer) {
    return undefined
  }

  const blockSize = 5, // only visit every 5 pixels
    canvas = createCanvas(size.width, size.height),
    context = canvas.getContext && canvas.getContext('2d')
  let data
  const width = size.width,
    height = size.height
  let i = -4,
    count = 0
  const rgb = { r: 0, g: 0, b: 0 }

  if (!context) {
    return undefined
  }
  const image = await loadImage(buffer)
  context.drawImage(image, 0, 0)

  try {
    data = context.getImageData(0, 0, width, height)
  } catch (e) {
    /* security error, img on diff domain */
    return undefined
  }

  const length = data.data.length

  while ((i += blockSize * 4) < length) {
    ++count
    rgb.r += data.data[i]
    rgb.g += data.data[i + 1]
    rgb.b += data.data[i + 2]
  }

  // ~~ used to floor values
  rgb.r = ~~(rgb.r / count)
  rgb.g = ~~(rgb.g / count)
  rgb.b = ~~(rgb.b / count)

  return rgbToHex(rgb)
}

function componentToHex(c: number) {
  const hex = c.toString(16)
  return hex.length == 1 ? '0' + hex : hex
}

export function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}
