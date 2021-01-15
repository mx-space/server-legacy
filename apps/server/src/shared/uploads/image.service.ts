import { File, FileLocate, FileType } from '@libs/db/models/file.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { shuffle } from 'lodash'
import { InjectModel } from 'nestjs-typegoose'
import { ConfigsService } from '../../../../../shared/global/configs/configs.service'
import { UploadsService } from './uploads.service'
import Pic = require('picgo')
@Injectable()
export class ImageService {
  public rootPath = UploadsService.rootPath
  private pic = new Pic()

  constructor(
    @InjectModel(File) private readonly model: ReturnModelType<typeof File>,
    private readonly configs: ConfigsService,
  ) {
    this.pic.setConfig({
      picBed: {
        current: 'github',
        github: {
          branch: 'master',
          customUrl: configs.imageBed.customUrl,
          path: '',
          repo: configs.imageBed.repo,
          token: configs.imageBed.token,
        },
      },
    })
  }

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

    return randomImages.splice(0, size)
  }

  async syncToImageBed(files: [{ path: string; name: string }]) {
    const res = []
    for await (const file of files) {
      await this.pic.upload([file.path])

      this.pic.output.map(async (pic) => {
        if (!pic.imgUrl) {
          return console.error('图片上传失败')
        }
        const imageUrl = pic.imgUrl
        await this.model.updateOne(
          { name: file.name },
          {
            locate: FileLocate.Online,
            url: imageUrl,
          },
        )
        return imageUrl
      })
    }
    return res
  }
}
