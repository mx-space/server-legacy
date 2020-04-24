import { Injectable, BadRequestException } from '@nestjs/common'
import * as crypto from 'crypto'
import { fromBuffer } from 'file-type'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { InjectModel } from 'nestjs-typegoose'
import { ReturnModelType } from '@typegoose/typegoose'
import { imageSize } from 'image-size'
import { File } from '@libs/db/models/file.model'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { Readable } from 'stream'
@Injectable()
export class UploadsService {
  constructor(
    @InjectModel(File) private readonly model: ReturnModelType<typeof File>,
  ) {}
  public static imagePath = '/images'
  public imagePath = UploadsService.imagePath
  async saveImage(fileInfo) {
    const { data, filename /* , mimetype, limit  */ } = fileInfo
    const hashFilename = crypto.createHash('md5').update(filename).digest('hex')
    const { ext, mime } = await fromBuffer(data)
    if (!mime.match(/^image/)) {
      throw new BadRequestException('仅能存储图片格式')
    }
    const dimensions = imageSize(data)
    await this.model.updateOne(
      { name: hashFilename },
      {
        filename,
        name: hashFilename,
        dimensions,
        mime,
      } as File,
      { upsert: true },
    )

    const path = join(
      __dirname,
      `../uploads${this.imagePath}`,
      hashFilename,
    )
    if (!existsSync(path)) {
      writeFileSync(path, data)
    }
    return { ext, mime, hashFilename, filename }
  }

  async checkFileExist(filename: string, postfix = '') {
    const doc = await this.model.findOne({ name: filename } as File)
    if (!doc) {
      throw new CannotFindException()
    }
    const { name, mime } = doc
    return {
      buffer: readFileSync(join(__dirname, `../uploads${postfix}`, name)),
      mime,
    }
  }

  getReadableStream(buffer: Buffer): Readable {
    const stream = new Readable()

    stream.push(buffer)
    stream.push(null)

    return stream
  }
}
