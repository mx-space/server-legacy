import { File } from '@libs/db/models/file.model'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import * as crypto from 'crypto'
import { fromBuffer } from 'file-type'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { imageSize } from 'image-size'
import * as mkdirp from 'mkdirp'
import { InjectModel } from 'nestjs-typegoose'
import { join } from 'path'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { Readable } from 'stream'

@Injectable()
export class UploadsService {
  constructor(
    @InjectModel(File) private readonly model: ReturnModelType<typeof File>,
  ) {
    const path = join(this.rootPath, this.imagePath)
    mkdirp.sync(path)
  }

  public static imagePath = '/images'
  public static rootPath =
    process.env.NODE_ENV === 'development'
      ? join(__dirname, '../uploads')
      : '~/.mxspace/uploads'
  public imagePath = UploadsService.imagePath
  public rootPath = UploadsService.rootPath

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

    const path = join(`${this.rootPath}${this.imagePath}`, hashFilename)
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
      buffer: readFileSync(join(`${this.rootPath}${postfix}`, name)),
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
