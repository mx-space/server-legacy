/*
 * @Author: Innei
 * @Date: 2020-05-08 20:01:58
 * @LastEditTime: 2020-08-24 21:58:59
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/configs/configs.service.ts
 * @MIT
 */

import { Option } from '@libs/db/models/option.model'
import { User } from '@libs/db/models/user.model'
import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'

import {
  BackupOptions,
  BaiduSearchOptions,
  CommentOptions,
  ImageBedDto,
  MailOptionsDto,
  SEODto,
  UrlDto,
} from './configs.dto'

export interface IConfig {
  seo: SEODto
  url: UrlDto
  imageBed: ImageBedDto
  mailOptions: MailOptionsDto
  commentOptions: CommentOptions
  backupOptions: BackupOptions
  baiduSearchOptions: BaiduSearchOptions
}
export enum IConfigKeys {
  seo,
  url,
  imageBed,
  mailOptions,
  commentOptions,
  backupOptions,
}
@Injectable()
export class ConfigsService {
  private config: IConfig = {
    seo: {
      title: 'mx-space',
      description: 'Hello World~',
    },
    url: {
      wsUrl: 'http://localhost:8080', //todo
      adminUrl: 'http://localhost:9528',
      serverUrl: 'http://localhost:2333',
      webUrl: 'http://localhost:2323',
    },
    imageBed: {} as ImageBedDto,
    mailOptions: {} as MailOptionsDto,
    commentOptions: { antiSpam: false },
    backupOptions: { enable: false } as BackupOptions,
    baiduSearchOptions: { enable: false },
  }

  constructor(
    @InjectModel(Option)
    private readonly optionModel: ReturnModelType<typeof Option>,
    @InjectModel(User)
    private readonly userModel: ReturnModelType<typeof User>,
  ) {
    this.configInit()
  }

  protected async configInit() {
    const configs = await this.optionModel.find().lean()
    configs.map((field) => {
      const name = field.name as keyof IConfig
      const value = field.value
      this.config[name] = value
    })
  }

  public get seo() {
    return this.config.seo
  }

  public get url() {
    return this.config.url
  }

  public get imageBed() {
    return this.config.imageBed
  }

  async setSEO(seo: SEODto) {
    return await this.patch('seo', seo)
  }

  async setUrl(url: UrlDto) {
    return await this.patch('url', url)
  }

  public get<T extends keyof IConfig>(key: T): Readonly<IConfig[T]> {
    return this.config[key]
  }
  public getConfig(): Readonly<IConfig> {
    return this.config
  }

  public async patch<T extends keyof IConfig>(key: T, data: IConfig[T]) {
    await this.optionModel.updateOne(
      { name: key as string },
      { value: { ...this.config[key], ...data } },
      { upsert: true, omitUndefined: true },
    )
    const newData = (await this.optionModel.findOne({ name: key as string }))
      .value
    this.config[key] = newData

    return this.config[key]
  }

  public async getMaster() {
    const master = await this.userModel.findOne()
    if (!master) {
      throw new UnprocessableEntityException('未初始化')
    }
    return master
  }
}
