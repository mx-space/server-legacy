import {
  File,
  FileLocate,
  FileType,
  getFileType,
} from '@libs/db/models/file.model'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import * as crypto from 'crypto'
import { FastifyRequest } from 'fastify'
import { fromBuffer } from 'file-type'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { imageSize } from 'image-size'
import * as mkdirp from 'mkdirp'
import { InjectModel } from 'nestjs-typegoose'
import { homedir } from 'os'
import { join } from 'path'
import { plural } from 'pluralize'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { isDev } from 'src/utils'
import { Readable } from 'stream'
import { ConfigsService } from '../../common/global/configs/configs.service'
import { ImageService } from './image.service'

// @Injectable({ scope: Scope.REQUEST })
export class UploadsService {
  // TODO sync file between db and disk
  // private readonly imageService: ImageService
  constructor(
    @InjectModel(File) private readonly model: ReturnModelType<typeof File>,
    private readonly configs: ConfigsService, // private readonly imageService: ImageService,
  ) {
    // this.imageService = new ImageService(model, configs)
    this.initDirectory()
  }

  public static rootPath = isDev
    ? join(__dirname, '../uploads')
    : join(homedir(), '/.mx-space/uploads')
  public rootPath = UploadsService.rootPath

  public validMultipartField(req: FastifyRequest) {
    if (!req.isMultipart()) {
      throw new BadRequestException('仅供上传文件!')
    }
    if (!(req.body as any).file) {
      throw new BadRequestException('字段必须为 file')
    }
    // @ts-ignore
    return req.body.file as [
      {
        data: Buffer
        filename: string
        encoding: string
        mimetype: string
        limit: boolean
      },
    ]
  }
  validImage(req: FastifyRequest) {
    const fileInfo = this.validMultipartField(req)[0]
    if (!fileInfo) {
      throw new BadRequestException('文件丢失了')
    }
    if (fileInfo.limit) {
      throw new BadRequestException('文件不符合, 大小不得超过 6M')
    }
    return fileInfo
  }

  async saveImage(fileInfo, type = FileType.IMAGE) {
    const { data, filename /* , mimetype, limit  */ } = fileInfo
    const { ext, mime } = await fromBuffer(data)
    if (!mime.match(/^image/)) {
      throw new BadRequestException('仅能存储图片格式')
    }
    const hashFilename = crypto.createHash('md5').update(filename).digest('hex')
    const dimensions = imageSize(data)
    await this.model.updateOne(
      { name: hashFilename },
      {
        filename,
        name: hashFilename,
        dimensions,
        mime,
        type,
      } as File,
      { upsert: true },
    )

    const path = join(`${this.getType2Path(type)}`, hashFilename)
    if (!existsSync(path)) {
      writeFileSync(path, data)
      // FIXME image service bug
      // note: uploads not include avatar type
      if (type !== FileType.AVATAR) {
        new Promise((resolve) => {
          const imageService = new ImageService(this.model, this.configs)
          imageService.syncToImageBed([{ path, name: hashFilename }])
          resolve(null)
          // TODO image upload successful callback event to gateway
        })
      }
    }
    return { ext, mime, hashFilename, filename }
  }

  async checkFileExist(_name: string, type: FileType) {
    const doc = await this.model.findOne({ name: _name, type } as File)
    const postfix = this.getType2Path(type, false)
    if (!doc) {
      throw new CannotFindException()
    }
    const { name, mime, locate, url } = doc
    if (locate === FileLocate.Online) {
      return { url, mime, locate }
    }
    try {
      const buffer = readFileSync(join(this.rootPath, postfix, name))

      return {
        buffer,
        mime,
      }
    } catch {
      await doc.remove()
      throw new NotFoundException('文件已丢失')
    }
  }

  async getImageInfo(name: string, type: FileType) {
    const { mime, buffer } = await this.checkFileExist(name, type)
    if (buffer) {
      const fType = await fromBuffer(buffer)
      const size = imageSize(buffer)

      return { mime, type: fType, size }
    } else {
      const doc = await this.model.findOne({ name, type } as File)
      return doc
    }
  }

  getReadableStream(buffer: Buffer): Readable {
    const stream = new Readable()

    stream.push(buffer)
    stream.push(null)

    return stream
  }

  async deleteFile(id: string) {
    const doc = await this.model.findById(id)
    if (!doc) {
      throw new CannotFindException()
    }
    const { type, name } = doc

    await this.model.deleteOne({ _id: id })
    try {
      unlinkSync(join(this.getType2Path(type as FileType), name))
    } catch {}
    return 'OK'
  }

  private getType2Path(type: FileType, includeRootPath = true) {
    const ft = getFileType(type)
    return includeRootPath ? join(this.rootPath, plural(ft)) : plural(ft)
  }

  protected initDirectory() {
    const keys = Object.keys(FileType)
    const types = keys.splice(keys.length / 2)
    types.forEach((type) => {
      const t = type.toLowerCase()
      const dir = plural(t)
      const path = join(this.rootPath, dir)
      mkdirp.sync(path)
    })
  }

  findFiles(type?: FileType) {
    return this.model.find(type ? { type } : {}).sort({ created: -1 })
  }
}
