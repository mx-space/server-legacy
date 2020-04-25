import { File, FileType } from '@libs/db/models/file.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { random, shuffle } from 'lodash'
import { InjectModel } from 'nestjs-typegoose'
@Injectable()
export class ImageService {
  constructor(
    @InjectModel(File) private readonly model: ReturnModelType<typeof File>,
  ) {}

  async getRandomImages(size = 5, type: FileType) {
    if (size < 1) {
      return []
    }

    const allImages = await this.model.find({ type }).lean()
    if (!allImages.length) {
      return []
    }
    const randomImages = shuffle(allImages)
    if (size === 1) {
      return randomImages.pop()
    }

    if (allImages.length <= size) {
      return randomImages
    }

    // const indexes = new Set()
    // const images = []
    // while (indexes.size < size) {
    //   const randInt = random(0, allImages.length - 1, false)
    //   if (!indexes.has(randInt)) {
    //     images.push(allImages[randInt])
    //   }
    //   indexes.add(randInt)
    // }

    return randomImages.splice(0, size)
  }
}
